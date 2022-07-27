import {hkdf} from "@noble/hashes/hkdf"
import {hmac} from "@noble/hashes/hmac"
import {sha256} from "@noble/hashes/sha256"

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
export const write = (input: AgeEncryptionInput): string => {
    const header = `${input.version}\n${recipients(input.recipients)}`
    const macKey = mac(createMacKey(input.fileKey, input.headerMacMessage, header))

    return `${header}${macKey}\n${ciphertext(input.body)}`
}

// parses an AGE encrypted string into a model object with all the
// relevant parts encoded correctly
// throws errors if things are missing or in the wrong place
export const read = (input: string): AgeEncryptionOutput => {
    const [version, ...lines] = input.split("\n")

    const identities: Array<Stanza> = []
    let current = lines.shift()

    while (!!current && current.startsWith("-> ")) {
        const [type, ...args] = current.slice(3, current.length).split(" ")
        const body = lines.shift()
        if (!body) {
            throw Error(`expected stanza '${type} to have a body, but it didn't`)
        }

        identities.push({type, args, body: Buffer.from(body, "base64")})
        current = lines.shift()
    }

    const mac = current ?? ""
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

function createMacKey(fileKey: Uint8Array, macMessage: string, headerText: string): Uint8Array {
    const hmacKey = hkdf(sha256, fileKey, "", macMessage, 32)
    return Buffer.from(hmac(sha256, hmacKey, headerText))
}

const mac = (macStr: Uint8Array) =>
    `--- ${Buffer.from(macStr).toString("base64")}`

const ciphertext = (body: Uint8Array) =>
    Buffer.from(body).toString("binary")