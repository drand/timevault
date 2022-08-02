import {createMacKey} from "./hmac"
import {unpaddedBase64} from "./util"

type Stanza = {
    type: string,
    args: Array<string>,
    body: Uint8Array
}

type AgeEncryptionInput = {
    fileKey: Uint8Array
    version: string
    recipients: Array<Stanza>
    body: Uint8Array
    headerMacMessage: string
}

type AgeEncryptionOutput = {
    header: {
        version: string
        recipients: Array<Stanza>
        mac: Uint8Array
    }
    body: Uint8Array
}

// takes the model to be encrypted and encodes everything to a string
// inserting newlines, other tags and the hmac as per the spec
export function writeAge(input: AgeEncryptionInput): string {
    const headerStr = header(input)
    const macKey = mac(createMacKey(input.fileKey, input.headerMacMessage, headerStr))
    return `${headerStr} ${macKey}\n${ciphertext(input.body)}`
}

// ends with a `---`, as this is included in the header when
// calculating the MAC
export function header(input: AgeEncryptionInput): string {
    return `${input.version}\n${recipients(input.recipients)}---`
}

// parses an AGE encrypted string into a model object with all the
// relevant parts encoded correctly
// throws an error if things are missing, in the wrong place or cannot
// be parsed
export function readAge(input: string): AgeEncryptionOutput {
    const [version, ...lines] = input.split("\n")

    const identities: Array<Stanza> = []
    let current = lines.shift()
    if (!current) {
        throw Error("Expected at least one stanza! (beginning with -->)")
    }

    while (!!current && current.startsWith("-> ")) {
        const [type, ...args] = current.slice(3, current.length).split(" ")
        const body = lines.shift()
        if (!body) {
            throw Error(`expected stanza '${type} to have a body, but it didn't`)
        }

        identities.push({type, args, body: Buffer.from(body, "base64")})
        current = lines.shift()
    }

    const macStartingTag = "--- "
    if (!current || !current.startsWith(macStartingTag)) {
        throw Error("Expected mac, but there were no more lines left!")
    }

    // mac cannot be validated yet, as we don't have the filekey
    const mac = current.slice(macStartingTag.length, current.length)
    const ciphertext = lines.join("") ?? ""

    return {
        header: {
            version,
            recipients: identities,
            mac: Buffer.from(mac, "base64")
        },
        body: Buffer.from(ciphertext, "binary")
    }
}

const recipients = (stanzas: Array<Stanza>) =>
    stanzas.map(it => recipient(it) + "\n")

const recipient = (stanza: Stanza) => {
    const type = stanza.type
    const aggregatedArgs = stanza.args.join(" ")
    const encodedBody = unpaddedBase64(stanza.body)

    return `-> ${type} ${aggregatedArgs}\n${encodedBody}`
}

// The `---` preceding the MAC is technically part of the MAC-able text
// so it's included in the header instead
const mac = (macStr: Uint8Array) =>
    `${unpaddedBase64(macStr)}`

const ciphertext = (body: Uint8Array) =>
    Buffer.from(body).toString("binary")
