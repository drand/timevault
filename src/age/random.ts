// a string of n bytes read from a CSPRNG like /dev/urandom.
export async function random(n: number): Promise<Uint8Array> {
    if (typeof window === "object" && "crypto" in window) {
        return window.crypto.getRandomValues(new Uint8Array(n))
    }

    // parcel likes to resolve polyfills for things even if they aren't used
    // so this indirection tricks it into not doing it and not complaining :)
    const x = "crypto"
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bytes = require(x).randomBytes(n)
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}
