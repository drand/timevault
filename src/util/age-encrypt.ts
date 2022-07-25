import {sha256} from "@noble/hashes/sha256"
import {hmac} from "@noble/hashes/hmac"
import {hkdf} from "@noble/hashes/hkdf"
import {STREAM} from "./stream-cipher"
import {random} from "./random"

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

type AgeConfig = {
    versionText: string, // the AGE version this conforms too
    headerMacMessage: string, // message used for the HKDF in the header mac
    bodyMacMessage: string, // message used for the HKDF in the body mac
}

const ageArmorConfig = {
    versionText: "age-encryption.org/v1",
    headerMacMessage: "header",
    bodyMacMessage: "payload",
}

function encryptAge(
    plaintext: Uint8Array,
    recipients: Array<Stanza> = [],
    config: AgeConfig = ageArmorConfig,
): string {
    const fileKey = random(32)
    return header(fileKey, recipients, config) + encryptedPayload(fileKey, plaintext, config)
}

function header(fileKey: Uint8Array, recipients: Array<Stanza>, config: AgeConfig) {
    const recipientStanzas = stanzas(recipients)
    const headerText = `${config.versionText}\n${recipientStanzas}---`
    // salt is empty as per the spec
    const someHkdf = hkdf(sha256, fileKey, "", config.headerMacMessage, sha256.outputLen)
    const hmacText = Buffer.from(hmac(sha256, someHkdf, headerText)).toString("base64")

    return `${headerText} ${hmacText}\n`
}

function stanzas(recipients: Array<Stanza>): string {
    return recipients.map(it => stanza(it)).map(it => it + "\n").join("")
}

function stanza(recipient: Stanza): string {
    const args = recipient.args.join(" ")
    const body = Buffer.from(recipient.body).toString("base64")
    return `-> ${recipient.type} ${args}\n ${body}`
}

function encryptedPayload(fileKey: Uint8Array, payload: Uint8Array, config: AgeConfig): string {
    const nonce = random(16)
    const key = hkdf(sha256, new Uint8Array(Buffer.from(config.bodyMacMessage)), nonce, fileKey, sha256.outputLen)
    return Buffer.from(STREAM.seal(payload, key)).toString("base64")
}

export {encryptAge}
