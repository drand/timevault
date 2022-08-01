// as per the spec:
// RFC 4648, Section 4
// without = padding characters (sometimes referred to as "raw" or "unpadded" base64)
export function unpaddedBase64(buf: Uint8Array | string): string {
    const encodedBuf = Buffer.from(buf).toString("base64")

    let lastIndex = encodedBuf.length - 1

    while (encodedBuf[lastIndex] === "=") {
        lastIndex--
    }

    return encodedBuf.slice(0, lastIndex + 1)
}

export function unpaddedBase64Buffer(buf: Uint8Array | string): Buffer {
    return Buffer.from(unpaddedBase64(buf), "base64")
}
