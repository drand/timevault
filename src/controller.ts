import * as yup from "yup"

const webFormSchema = yup.object({
    plaintext: yup.string().nullable(true).optional(),
    ciphertext: yup.string().nullable(true).optional(), // should really limit to base64 + armor header/footer
    decryptionTime: yup.number()
        .positive()
        .moreThan(Date.now(), "Decryption time must be in the future!")
        .required()
}).required()

export type CompletedWebForm = yup.InferType<typeof webFormSchema>

export async function encryptedOrDecryptedFormData(form: unknown): Promise<CompletedWebForm> {
    const partialWebForm = await webFormSchema.validate(form)

    if (partialWebForm.plaintext) {
        return encrypt(partialWebForm.plaintext, partialWebForm.decryptionTime)

    } else if (partialWebForm.ciphertext) {
        return decrypt(partialWebForm.ciphertext, partialWebForm.decryptionTime)
    }

    return Promise.reject("Neither plaintext nor partialtext were input")
}

function encrypt(plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
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
