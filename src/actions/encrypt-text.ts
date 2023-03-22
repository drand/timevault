import * as yup from "yup"
import {mainnetClient, roundAt, timelockDecrypt, timelockEncrypt} from "tlock-js"
import {MAINNET_CHAIN_INFO} from "tlock-js/drand/defaults"
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
    const roundNumber = roundAt(decryptionTime, MAINNET_CHAIN_INFO)
    const ciphertext = await timelockEncrypt(roundNumber, Buffer.from(plaintext), mainnetClient())
    return {
        plaintext,
        decryptionTime,
        ciphertext
    }
}

async function decrypt(ciphertext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const plaintext = await timelockDecrypt(ciphertext, mainnetClient())
    return {
        plaintext,
        decryptionTime,
        ciphertext,
    }
}
