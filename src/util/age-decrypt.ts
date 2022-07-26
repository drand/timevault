import {STREAM} from "./stream-cipher"
import {Stanza} from "./age-encrypt";
import {defaultAgeConfig} from "./constants";
import {NoOpEncdec} from "./no-op-encdec";
import {hmac} from "@noble/hashes/hmac";

type AgeDecryptionConfig = {
    versionText: string, // the AGE version this conforms too
    headerMacMessage: string, // message used for the HKDF in the header mac
    bodyMacMessage: string, // message used for the HKDF in the body mac
}

// some underlying decryption implementation for the payload
type DecryptionIdentity = {
    // this function will take some list of recipients and return the filekey
    unwrap: (recipients: Array<Stanza>) => Uint8Array
}

export function decryptAge(
    payload: string,
    decrypter: DecryptionIdentity = NoOpEncdec,
    config: AgeDecryptionConfig = defaultAgeConfig
): string {

    const [version, ...lines] = payload.split("\n")

    if (version !== config.versionText) {
        throw Error(`Expected ${config.versionText}, found ${version}`)
    }

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

    // once we break the loop, the current points to the hmac
    const hmacTag = current

    if (!hmacTag || !hmacTag.startsWith("--- ")) {
        console.log(hmacTag)
        throw Error(`expected hmac started (---), received ${hmacTag}`)
    }

    const ciphertext = lines.shift()
    if (!ciphertext) {
        throw new Error("Expected to parse a ciphertext but couldn't find it!")
    }

    const fileKey = decrypter.unwrap(identities)
    return Buffer.from(STREAM.open(Buffer.from(ciphertext, "binary"), fileKey)).toString("utf8")
}