// a string of n bytes read from a CSPRNG like /dev/urandom.
export function random(n: number): Uint8Array {
    if (typeof window === "object" && "crypto" in window) {
        return window.crypto.getRandomValues(new Uint8Array(n))
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytes = require("crypto").randomBytes(n)
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}
