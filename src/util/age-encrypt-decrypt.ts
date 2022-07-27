import {STREAM} from "./stream-cipher"
import {random} from "./random"
import {NoOpEncdec} from "./no-op-encdec"
import {read, write} from "./age-reader-writer"

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
export type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

// some underlying encryption implementation for the payload
// likely with a corresponding decrypter
type EncryptionIdentity = {
    // takes a file key and turns it into a list of implementation stanzas
    wrap: (fileKey: Uint8Array) => Array<Stanza>
}

// some underlying decryption implementation for the payload
type DecryptionIdentity = {
    // this function will take some list of recipients and return the filekey
    unwrap: (recipients: Array<Stanza>) => Uint8Array
}

// encrypts a plaintext payload using AGE
export function encryptAge(
    plaintext: Uint8Array,
    encrypter: EncryptionIdentity = NoOpEncdec
): string {
    const fileKey = random(32)
    const encryptionParams = {
        fileKey,
        version: "age-encryption.org/v1",
        recipients: encrypter.wrap(fileKey),
        headerMacMessage: "header", // message used for the HKDF in the header mac
        body: encryptedPayload(fileKey, plaintext)
    }

    return write(encryptionParams)
}

function encryptedPayload(fileKey: Uint8Array, payload: Uint8Array): Uint8Array {
    return STREAM.seal(payload, fileKey)
}

// decrypts a payload that has been encrypted using AGE
export function decryptAge(
    payload: string,
    decrypter: DecryptionIdentity = NoOpEncdec
): string {
    const encrypted = read(payload)
    const fileKey = decrypter.unwrap(encrypted.header.recipients)
    return Buffer.from(STREAM.open(encrypted.body, fileKey)).toString("utf8")
}

