import {hkdf} from "@noble/hashes/hkdf"
import {sha256} from "@noble/hashes/sha256"
import {hmac} from "@noble/hashes/hmac"

export function createMacKey(fileKey: Uint8Array, macMessage: string, headerText: string): Uint8Array {
    // empty string salt as per the spec!
    const hmacKey = hkdf(sha256, fileKey, "", Buffer.from(macMessage, "utf8"), 32)
    return Buffer.from(hmac(sha256, hmacKey, Buffer.from(headerText, "utf8")))
}
