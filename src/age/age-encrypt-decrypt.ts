import {STREAM} from "./stream-cipher"
import {random} from "./random"
import {NoOpEncdec} from "./no-op-encdec"
import {header, read, write} from "./age-reader-writer"
import {createMacKey} from "./hmac";

type FileKey = Uint8Array
type EncryptionWrapper = (fileKey: FileKey) => Array<Stanza>
type DecryptionWrapper = (recipients: Array<Stanza>) => FileKey

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
export type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

const ageVersion = "age-encryption.org/v1"
const hkdfHeaderMessage = "header"

// encrypts a plaintext payload using AGE by generating a filekey
// and passing the filekey to another encryption wrapper for handling
export function encryptAge(
    plaintext: Uint8Array,
    wrappedEncryption: EncryptionWrapper = NoOpEncdec.wrap
): string {
    const fileKey = random(32)
    const encryptionParams = {
        fileKey,
        version: ageVersion,
        recipients: wrappedEncryption(fileKey),
        headerMacMessage: hkdfHeaderMessage,
        body: encryptedPayload(fileKey, plaintext)
    }

    return write(encryptionParams)
}

function encryptedPayload(fileKey: Uint8Array, payload: Uint8Array): Uint8Array {
    return STREAM.seal(payload, fileKey)
}

// decrypts a payload that has been encrypted using AGE
// can unwrap any internal encryption by passing recipients who can
// provide the `filekey` created during encryption
export function decryptAge(
    payload: string,
    unwrapEncryption: DecryptionWrapper = NoOpEncdec.unwrap
): string {
    const encryptedPayload = read(payload)
    const version = encryptedPayload.header.version
    if (version !== ageVersion) {
        throw Error(`The payload version ${version} is not supported, only ${ageVersion}`)
    }

    const fileKey = unwrapEncryption(encryptedPayload.header.recipients)
    const header = sliceUntil(payload, "---")
    const expectedMac = createMacKey(fileKey, hkdfHeaderMessage, header)

    if (Buffer.compare(expectedMac, encryptedPayload.header.mac)) {
        throw Error("The MAC did not validate for the filekey and payload!")
    }
    return Buffer.from(STREAM.open(encryptedPayload.body, fileKey)).toString("utf8")
}

// slices a the input string up to and including the first
// occurrence of the string provided in `searchTerm`
// returns the whole string if it's not found
// e.g. sliceUntil("hello world", "ll") will return "hell"
function sliceUntil(input: string, searchTerm: string) {
    let endPointer = 0
    for (let i = 0; i < input.length; ++i) {
        if (endPointer === searchTerm.length - 1) {
            return input.slice(0, i + 1)
        }

        if (input[i] === searchTerm[endPointer]) {
            ++endPointer
        } else {
            endPointer = 0
        }
    }

    return input
}
