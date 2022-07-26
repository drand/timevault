import {sha256} from "@noble/hashes/sha256"
import {hmac} from "@noble/hashes/hmac"
import {hkdf} from "@noble/hashes/hkdf"
import {STREAM} from "./stream-cipher"
import {random} from "./random"
import {defaultAgeConfig} from "./constants"
import {NoOpEncdec} from "./no-op-encdec"

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
export type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}
type AgeConfig = {
    versionText: string, // the AGE version this conforms too
    headerMacMessage: string, // message used for the HKDF in the header mac
    bodyMacMessage: string,
}

// some underlying encryption implementation for the payload
// likely with a corresponding decrypter
type EncryptionIdentity = {
    // takes a file key and turns it into a list of implementation stanzas
    wrap: (fileKey: Uint8Array) => Array<Stanza>
}

function encryptAge(
    plaintext: Uint8Array,
    encrypter: EncryptionIdentity = NoOpEncdec,
    config: AgeConfig = defaultAgeConfig,
): string {
    const fileKey = random(32)
    return header(fileKey, encrypter, config) +
        Buffer.from(encryptedPayload(fileKey, plaintext, encrypter, config)).toString("binary")
}

function header(fileKey: Uint8Array, encrypter: EncryptionIdentity, config: AgeConfig): string {
    const recipientStanzas = encodedStanzas(encrypter.wrap(fileKey))
    const headerText = `${config.versionText}\n${recipientStanzas}`
    // salt is empty as per the spec, output key is 32 bytes in line with the go impl
    const hmacKey = hkdf(sha256, fileKey, "", config.headerMacMessage, 32)
    const hmacText = Buffer.from(hmac(sha256, hmacKey, headerText)).toString("base64")

    return `${headerText}--- ${hmacText}\n`
}

function encodedStanzas(recipients: Array<Stanza>): string {
    return recipients.map(it => stanza(it)).map(it => it + "\n").join("")
}

function stanza(recipient: Stanza): string {
    const args = recipient.args.join(" ")
    const body = Buffer.from(recipient.body).toString("base64")
    return `-> ${recipient.type} ${args}\n${body}`
}

function encryptedPayload(fileKey: Uint8Array, payload: Uint8Array, encrypter: EncryptionIdentity, config: AgeConfig): Uint8Array {
    const nonce = random(16)
    const key = hkdf(sha256, new Uint8Array(Buffer.from(config.bodyMacMessage)), nonce, fileKey, sha256.outputLen)
    return STREAM.seal(payload, key)
}

export {encryptAge}
