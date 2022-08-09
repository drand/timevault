import * as yup from "yup"
import {defaultClientInfo, roundForTime, timelockDecrypt, timelockEncrypt} from "tlock-js"
import {webFormSchema} from "../schema/webform-schema"

export type CompletedWebForm = yup.InferType<typeof webFormSchema>

export async function encryptedOrDecryptedFormData(form: unknown): Promise<CompletedWebForm> {
    const partialWebForm = await webFormSchema.validate(form)

    if (partialWebForm.plaintext) {
        return encrypt(partialWebForm.plaintext, partialWebForm.decryptionTime)

    } else if (partialWebForm.ciphertext) {
        return decrypt(partialWebForm.ciphertext, partialWebForm.decryptionTime)
    }

    return Promise.reject("Neither plaintext nor ciphertext were input")
}

async function encrypt(plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const roundNumber = roundForTime(decryptionTime, defaultClientInfo)
    const ciphertext = await timelockEncrypt(roundNumber, plaintext)
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
