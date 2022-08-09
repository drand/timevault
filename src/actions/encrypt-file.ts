import {defaultClientInfo, roundForTime, timelockEncrypt} from "tlock-js"

export async function encryptFile(files: FileList, decryptionTime: number): Promise<string> {
    if (files.length === 0) {
        throw Error("You must select a file to encrypt!")
    }

    if (files.length > 1) {
        throw Error("Right now you can only encrypt a single file - try zipping your files!")
    }

    const file = files.item(0)
    if (!file) {
        throw Error("Somehow there  was no file in the file list!")
    }

    const roundNumber = roundForTime(decryptionTime, defaultClientInfo)

    return await timelockEncrypt(roundNumber, Buffer.from(new Uint8Array(await file.arrayBuffer())))
}
