import * as yup from "yup"
import {timelockDecrypt} from "tlock-js"
import {vulnerabilityDecryptionSchema} from "../schema/vulnerability-encryption-schema"
import {fileExtension} from "./file-utils"


type TextContent = { type: "text", value: string }
type FileContent = { type: "file", value: File }
type VulnerabilityReportContent = { type: "vulnerability_report", value: yup.InferType<typeof vulnerabilityDecryptionSchema> }
export type DecryptionContent = TextContent | FileContent | VulnerabilityReportContent

export async function decryptMulti(ciphertext: string): Promise<DecryptionContent> {
    const plaintext = await timelockDecrypt(ciphertext)

    if (await vulnerabilityDecryptionSchema.isValid(plaintext)) {
        return {
            type: "vulnerability_report",
            value: await vulnerabilityDecryptionSchema.validate(plaintext)
        }
    }

    const plaintextBuffer = Buffer.from(plaintext, "binary")
    const fileExtensionOrEmpty = fileExtension(plaintextBuffer)

    // if the file extension is empty, skip and treat it as text
    if (fileExtensionOrEmpty !== "") {
        return {
            type: "file",
            value: new File([plaintextBuffer], `decrypted_data${fileExtensionOrEmpty}`)
        }
    }

    return {
        type: "text",
        value: plaintext
    }
}
