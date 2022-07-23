import * as yup from "yup"
import {webFormSchema} from "./schema/webform-schema"
import {DrandHttpClient} from "./drand/drand-client";

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

async function encrypt(plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const drandClient = DrandHttpClient.createFetchClient()
    const {randomness} = await drandClient.getLatest()
    return Promise.resolve({
        plaintext,
        decryptionTime,
        ciphertext: Buffer.from(plaintext + decryptionTime + randomness).toString("base64")
    })
}

function decrypt(ciphertext: string, decryptionTime: number): Promise<CompletedWebForm> {
    return Promise.resolve({
        plaintext: "some great fake decryption",
        decryptionTime,
        ciphertext,
    })
}
