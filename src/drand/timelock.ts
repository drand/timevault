import {defaultClientInfo, DrandClient, DrandNetworkInfo, DrandHttpClient} from "./drand-client"
import {decryptAge, encryptAge, Stanza} from "../age/age-encrypt-decrypt"
import {encodeArmor, decodeArmor, isProbablyArmored} from "../age/armor"
import {PointG1, PointG2} from "@noble/bls12-381"
import {sha256} from "@noble/hashes/sha256"
import * as ibe from "../crypto/ibe"
import {Ciphertext} from "../crypto/ibe"

export async function timelockEncrypt(
    config: DrandNetworkInfo,
    roundNumber: number,
    payload: string,
    drandHttpClient: DrandClient = DrandHttpClient.createFetchClient(),
): Promise<string> {
    const timelockEncrypter = createTimelockEncrypter(defaultClientInfo, drandHttpClient, roundNumber)
    const agePayload = await encryptAge(Buffer.from(payload), timelockEncrypter)
    return encodeArmor(agePayload)
}

export async function timelockDecrypt(
    ciphertext: string,
    drandHttpClient: DrandClient = DrandHttpClient.createFetchClient()
): Promise<string> {
    const timelockDecrypter = createTimelockDecrypter(drandHttpClient)

    let cipher = ciphertext
    if (isProbablyArmored(ciphertext)) {
        cipher = decodeArmor(cipher)
    }

    return await decryptAge(cipher, timelockDecrypter)
}

const timelockTypeName = "tlock"

export function createTimelockEncrypter(chainInfo: DrandNetworkInfo, network: DrandClient, roundNumber: number) {
    if (roundNumber < 1) {
        throw Error("You cannot encrypt for a roundNumber less than 1 (genesis = 0)")
    }

    return async (filekey: Uint8Array): Promise<Array<Stanza>> => {
        // probably should get chainHash through /info
        const point = PointG1.fromHex(chainInfo.publicKey)
        const roundNumberBuffer = Buffer.alloc(8)
        roundNumberBuffer.writeBigUInt64BE(BigInt(roundNumber))
        const id = sha256(roundNumberBuffer)
        const ciphertext = await ibe.encrypt(point, id, filekey)
        const body = Buffer.concat([ciphertext.U.toRawBytes(true), ciphertext.V, ciphertext.W])

        return [{
            type: timelockTypeName,
            args: [`${roundNumber}`, defaultClientInfo.chainHash],
            body
        }]
    }
}

export function createTimelockDecrypter(network: DrandClient) {
    return async (recipients: Array<Stanza>): Promise<Uint8Array> => {
        if (recipients.length !== 1) {
            throw Error("Timelock only expects a single stanza!")
        }

        const {type, args, body} = recipients[0]

        if (type !== timelockTypeName) {
            throw Error(`Timelock expects the type of the stanza to be ${timelockTypeName}`)
        }

        if (args.length !== 2) {
            throw Error(`Timelock stanza expected 2 args: roundNumber and chainHash. Only received ${args.length}`)
        }

        // should probably verify chain hash here too
        const [roundNumber] = args
        // ie. if it is NaN
        const roundNumberParsed = Number.parseInt(roundNumber)
        if (roundNumberParsed !== Number.parseInt(roundNumber)) {
            throw Error("Expected the roundNumber arg to be a number, but it was not!")
        }

        // just some pointless fetching of beacons to get realistic performance
        const beacon = await network.get(roundNumberParsed)
        console.log(`beacon received: ${JSON.stringify(beacon)}`)

        const g2 = PointG2.fromHex(beacon.signature)
        const ciphertext = parseCiphertext(body)
        return await ibe.decrypt(g2, ciphertext)
    }
}

function parseCiphertext(body: Uint8Array): Ciphertext {
    const g1Length = PointG1.BASE.toRawBytes(true).byteLength
    const g1Bytes = body.subarray(0, g1Length)
    const theRest = body.subarray(g1Length)
    const eachHalf = theRest.length / 2

    const U = PointG1.fromHex(Buffer.from(g1Bytes).toString("hex"))
    const V = theRest.subarray(0, eachHalf)
    const W = theRest.subarray(eachHalf)

    return {U, V, W}
}
