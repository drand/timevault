import {sha256} from "@noble/hashes/sha256"
import {hmac} from "@noble/hashes/hmac"

// `Stanza` is a section of the age header that encapsulates the file key as
// encrypted to a specific recipient.
type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

type ArmorConfig = {
    encodingTitleText: string
    introText: string,
    macMessage: string,
    maxColumns: number
}

const ageArmorConfig = {
    encodingTitleText: "AGE ENCRYPTED",
    introText: "age-encryption.org/v1",
    macMessage: "header",
    maxColumns: 64,
}

function encodeArmor(
    fileKey: Uint8Array,
    recipients: Array<Stanza> = [],
    config: ArmorConfig = ageArmorConfig,
): string {
    return header(config) +
        `${config.introText}\n` +
        stanzas(recipients, config) +
        mac(fileKey, config.macMessage) +
        encodedPayload(fileKey, config) +
        footer(config.encodingTitleText)
}

function header(config: ArmorConfig): string {
    if (config.encodingTitleText.trim().length === 0) {
        throw new Error("Armor encoding type cannot be empty")
    }
    return `-----BEGIN ${config.encodingTitleText.toUpperCase()} FILE-----\n`
}

function footer(type: string): string {
    return `-----END ${type.toUpperCase()} FILE-----\n`
}

function stanzas(recipients: Array<Stanza>, config: ArmorConfig): string {
    return recipients.map(it => stanza(it, config)).join("")
}

function stanza(recipient: Stanza, config: ArmorConfig): string {
    const args = recipient.args.join(" ")
    const body = chunked(Buffer.from(recipient.body).toString("base64"), config.maxColumns)
    return `-> ${recipient.type} ${args}\n ${body}\n`
}

function mac(key: Uint8Array, message: string): string {
    const macCipher = Buffer.from(hmac(sha256, key, message)).toString("base64")
    return `--- ${macCipher}\n`
}

function encodedPayload(payload: Uint8Array, config: ArmorConfig) {
    return chunked(
        Buffer.from(payload).toString("base64"),
        config.maxColumns,
        "\n"
    )
}

/*
    e.g. chunked("hello world", 2, ".") returns
    ["he.", "ll.", "o .", "wo.", "rl.", "d."]
 */
function chunked(input: string, chunkSize: number, suffix = ""): Array<string> {
    const output = []
    let currentChunk = ""
    for (let i = 0, chunks = 0; i < input.length; i++) {
        currentChunk += input[i]

        const posInChunk = i - (chunks * chunkSize)

        if (posInChunk === chunkSize - 1) {
            output.push(currentChunk + suffix)
            currentChunk = ""
            chunks++
        }
        if (i === input.length - 1) {
            output.push(currentChunk + suffix)
        }
    }

    return output
}

export {encodeArmor}
