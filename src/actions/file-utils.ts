export async function fileAsBuffer(file: File): Promise<Buffer> {
    return Buffer.from(new Uint8Array(await file.arrayBuffer()))
}
