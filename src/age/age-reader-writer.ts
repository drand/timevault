import {createMacKey} from "./hmac"

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
// inserting newlines other tags and the hmac as per the spec
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
// throws errors if things are missing or in the wrong place
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
    const ciphertext = lines.shift() ?? ""

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
    const encodedBody = Buffer.from(stanza.body).toString("base64")

    return `-> ${type} ${aggregatedArgs}\n${encodedBody}`
}

// The `---` preceding is technically part
// of the MAC-able text, but _not_ the space
const mac = (macStr: Uint8Array) =>
    `${Buffer.from(macStr).toString("base64")}`

const ciphertext = (body: Uint8Array) =>
    Buffer.from(body).toString("binary")