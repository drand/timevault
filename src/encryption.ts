import {CompletedWebForm, webFormSchema} from "./schema/webform-schema"

export async function encryptedOrDecryptedFormData(form: unknown): Promise<CompletedWebForm> {
    const partialWebForm = await webFormSchema.validate(form)

    if (partialWebForm.plaintext) {
        return encrypt(partialWebForm.plaintext, partialWebForm.decryptionTime)

    } else if (partialWebForm.ciphertext) {
        return decrypt(partialWebForm.ciphertext, partialWebForm.decryptionTime)
    }

    return Promise.reject("Neither plaintext nor partialtext were input")
}

async function encrypt(plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
    return Promise.resolve({
        plaintext,
        decryptionTime,
        ciphertext: Buffer.from(plaintext + decryptionTime).toString("base64")
    })
}

function decrypt(ciphertext: string, decryptionTime: number): Promise<CompletedWebForm> {
    return Promise.resolve({
        plaintext: "some great fake decryption",
        decryptionTime,
        ciphertext,
    })
}
