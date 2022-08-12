import * as yup from "yup"
import {defaultClientInfo, roundForTime, timelockDecrypt, timelockEncrypt} from "tlock-js"
import {textEncryptionSchema} from "../schema/text-encryption-schema"

export type CompletedWebForm = yup.InferType<typeof textEncryptionSchema>

export async function encryptedOrDecryptedFormData(form: unknown): Promise<CompletedWebForm> {
    const partialWebForm = await textEncryptionSchema.validate(form)

    if (partialWebForm.plaintext) {
        return encrypt(partialWebForm.plaintext, partialWebForm.decryptionTime)

    } else if (partialWebForm.ciphertext) {
        return decrypt(partialWebForm.ciphertext, partialWebForm.decryptionTime)
    }

    return Promise.reject("Neither plaintext nor ciphertext were input")
}

async function encrypt(plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const roundNumber = roundForTime(decryptionTime, defaultClientInfo)
    const ciphertext = await timelockEncrypt(roundNumber, Buffer.from(plaintext))
    return {
        plaintext,
        decryptionTime,
        ciphertext
    }
}

async function decrypt(ciphertext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const plaintext = await timelockDecrypt(ciphertext)
    return {
        plaintext,
        decryptionTime,
        ciphertext,
    }
}
