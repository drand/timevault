import * as yup from "yup"
import {HttpChainClient, roundAt, timelockDecrypt, timelockEncrypt} from "tlock-js"
import {textEncryptionSchema} from "../schema/text-encryption-schema"
import {Network} from "../App"
import {fastnet, quicknet, testnetQuicknet, testnetUnchained} from "./client-utils"

export type CompletedWebForm = yup.InferType<typeof textEncryptionSchema>

export async function encryptedOrDecryptedFormData(network: Network, form: unknown): Promise<CompletedWebForm> {
    const partialWebForm = await textEncryptionSchema.validate(form)
    let client: HttpChainClient
    switch (network) {
        case "quicknet":
            client = quicknet()
            break
        case "fastnet":
            client = fastnet()
            break
        case "quicknet-t":
            client = testnetQuicknet()
            break
        case "testnet-unchained-3s":
            client = testnetUnchained()
            break
        default: throw Error("unknown network")
    }

    if (partialWebForm.plaintext) {
        return encrypt(client, partialWebForm.plaintext, partialWebForm.decryptionTime)

    } else if (partialWebForm.ciphertext) {
        return decrypt(client, partialWebForm.ciphertext, partialWebForm.decryptionTime)
    }

    return Promise.reject("Neither plaintext nor ciphertext were input")
}

async function encrypt(client: HttpChainClient, plaintext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const chainInfo = await client.chain().info()
    const roundNumber = roundAt(decryptionTime, chainInfo)
    const ciphertext = await timelockEncrypt(roundNumber, Buffer.from(plaintext), client)
    return {
        plaintext,
        decryptionTime,
        ciphertext
    }
}

async function decrypt(client: HttpChainClient, ciphertext: string, decryptionTime: number): Promise<CompletedWebForm> {
    const plaintext = await timelockDecrypt(ciphertext, client)
    return {
        plaintext: plaintext.toString(),
        decryptionTime,
        ciphertext,
    }
}
