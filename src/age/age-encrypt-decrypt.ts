import {STREAM} from "./stream-cipher"
import {random} from "./random"
import {NoOpEncdec} from "./no-op-encdec"
import {readAge, writeAge} from "./age-reader-writer"
import {createMacKey} from "./hmac"
import {unpaddedBase64, unpaddedBase64Buffer} from "./util"
import {hkdf} from "@noble/hashes/hkdf"
import {sha256} from "@noble/hashes/sha256"
import {encodeArmor} from "./armor"

type FileKey = Uint8Array
type EncryptionWrapper = (fileKey: FileKey) => Promise<Array<Stanza>>
type DecryptionWrapper = (recipients: Array<Stanza>) => Promise<FileKey>

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
export type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

const ageVersion = "age-encryption.org/v1"
const hkdfHeaderMessage = "header"
const hkdfBodyMessage = Buffer.from("payload", "utf8")
const filekeyLengthBits = 32
const bodyHkdfNonceLengthBits = 16

// encrypts a plaintext payload using AGE by generating a filekey
// and passing the filekey to another encryption wrapper for handling
export async function encryptAge(
    plaintext: Uint8Array,
    wrapFileKey: EncryptionWrapper = NoOpEncdec.wrap
): Promise<string> {
    const fileKey = await random(filekeyLengthBits)
    const recipients = await wrapFileKey(fileKey)
    const body = await encryptedPayload(fileKey, plaintext)

    return writeAge({
            fileKey,
            version: ageVersion,
            recipients,
            headerMacMessage: hkdfHeaderMessage,
            body
        }
    )
}

async function encryptedPayload(fileKey: Uint8Array, payload: Uint8Array): Promise<Buffer> {
    const nonce = await random(bodyHkdfNonceLengthBits)
    const hkdfKey = hkdf(sha256, fileKey, nonce, hkdfBodyMessage, 32)
    const ciphertext = STREAM.seal(payload, hkdfKey)
    return Buffer.concat([nonce, ciphertext])
}

// decrypts a payload that has been encrypted using AGE
// can unwrap any internal encryption by passing recipients who can
// provide the `filekey` created during encryption
export async function decryptAge(
    payload: string,
    unwrapFileKey: DecryptionWrapper = NoOpEncdec.unwrap
): Promise<string> {
    const encryptedPayload = readAge(payload)
    const version = encryptedPayload.header.version
    if (version !== ageVersion) {
        throw Error(`The payload version ${version} is not supported, only ${ageVersion}`)
    }

    const fileKey = await unwrapFileKey(encryptedPayload.header.recipients)
    const header = sliceUntil(payload, "---")
    const expectedMac = unpaddedBase64Buffer(createMacKey(fileKey, hkdfHeaderMessage, header))
    const actualMac = encryptedPayload.header.mac

    if (Buffer.compare(actualMac, expectedMac) !== 0) {
        throw Error("The MAC did not validate for the filekey and payload!")
    }

    const nonce = Buffer.from(encryptedPayload.body.slice(0, bodyHkdfNonceLengthBits))
    const cipherText = encryptedPayload.body.slice(bodyHkdfNonceLengthBits)
    const hkdfKey = hkdf(sha256, fileKey, nonce, hkdfBodyMessage, 32)

    return Buffer.from(STREAM.open(cipherText, hkdfKey)).toString("utf8")
}

// slices the input string up to and including the first
// occurrence of the string provided in `searchTerm`
// returns the whole string if it's not found
// e.g. sliceUntil("hello world", "ll") will return "hell"
function sliceUntil(input: string, searchTerm: string) {
    let lettersMatched = 0
    let inputPointer = 0

    while (inputPointer < input.length && lettersMatched < searchTerm.length) {
        if (input[inputPointer] === searchTerm[lettersMatched]) {
            ++lettersMatched
        } else if (input[inputPointer] === searchTerm[0]) {
            lettersMatched = 1
        } else {
            lettersMatched = 0
        }

        ++inputPointer
    }

    return input.slice(0, inputPointer)
}
