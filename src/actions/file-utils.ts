export async function fileAsBuffer(file: File): Promise<Buffer> {
    return Buffer.from(new Uint8Array(await file.arrayBuffer()))
}

export function isSupportedFileType(file: File): boolean {
    return ["application/x-gzip", "application/x-tar", "application/zip"].includes(file.type)
}

export function fileExtension(input: Buffer): string {
    if (isGzip(input)) {
        return ".gz"
    }
    if (isZip(input)) {
        return ".zip"
    }
    if (isTar(input)) {
        return ".tar"
    }

    return ""
}

function isZip(buf: Buffer): boolean {
    const zipMagicBytes = [0x50, 0x4B]
    const validThirdBytes = [0x3, 0x5, 0x7]
    const validFourthBytes = [0x4, 0x6, 0x7]
    return buf.subarray(0, 2).equals(Buffer.from(new Uint8Array(zipMagicBytes))) &&
        validThirdBytes.includes(buf.readInt8(2)) &&
        validFourthBytes.includes(buf.readInt8(3))
}

function isTar(buf: Buffer): boolean {
    const readSum = Number.parseInt(buf.toString("utf8", 148, 154).replace(/\\0.*$/, "").trim(), 8)
    if (Number.isNaN(readSum)) {
        return false
    }

    let signedBitSum = 8 * 0x20

    for (let i = 0; i < 148; i++) {
        signedBitSum += buf[i]
    }

    for (let i = 156; i < 512; i++) {
        signedBitSum += buf[i]
    }

    return readSum === signedBitSum
}

function isGzip(buf: Buffer): boolean {
    const gzipMagicBytes = [0x1F, 0x8B, 0x8]
    return buf.subarray(0, 3).equals(Buffer.from(new Uint8Array(gzipMagicBytes)))
}

export function downloadFile(file: File) {
    const anchor = document.createElement("a")
    anchor.href = URL.createObjectURL(file)
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}
