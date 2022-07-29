import {defaultClientInfo, DrandClient, DrandNetworkInfo, DrandHttpClient} from "./drand-client"
import {decryptAge, encryptAge, Stanza} from "../age/age-encrypt-decrypt"
import {encodeArmor, decodeArmor, isProbablyArmored} from "../age/armor"

export async function timelockEncrypt(config: DrandNetworkInfo, roundNumber: number, payload: string): Promise<string> {
    const timelockEncrypter = createTimelockEncrypter(DrandHttpClient.createFetchClient(), roundNumber)
    const agePayload = await encryptAge(Buffer.from(payload), timelockEncrypter)
    return encodeArmor(agePayload)
}

export async function timelockDecrypt(ciphertext: string): Promise<string> {
    const timelockDecrypter = createTimelockDecrypter(DrandHttpClient.createFetchClient())

    let cipher = ciphertext
    if (isProbablyArmored(ciphertext)) {
        cipher = decodeArmor(cipher)
    }

    return await decryptAge(cipher, timelockDecrypter)
}

const timelockTypeName = "tlock"

export function createTimelockEncrypter(network: DrandClient, roundNumber: number) {
    return async (filekey: Uint8Array): Promise<Array<Stanza>> => {
        // probably should get chainHash through /info

        return [{
            type: timelockTypeName,
            args: [`${roundNumber}`, defaultClientInfo.chainHash],
            body: filekey
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
        console.log(`beacon received: ${beacon}`)

        return body
    }
}