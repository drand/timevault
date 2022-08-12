export async function fileAsBuffer(file: File): Promise<Buffer> {
    return Buffer.from(new Uint8Array(await file.arrayBuffer()))
}

export function downloadFile(file: File) {
    const anchor = document.createElement("a")
    anchor.href = URL.createObjectURL(file)
    anchor.download = file.name
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}
