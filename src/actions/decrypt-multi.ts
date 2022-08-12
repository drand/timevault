import {timelockDecrypt} from "tlock-js"
import {vulnerabilityDecryptionSchema} from "../schema/vulnerability-encryption-schema"
import {fileExtension} from "./file-utils"

type TextContent = { type: "text", value: string }
type VulnerabilityReportContent = {
    type: "vulnerability_report",
    value: {
        title: string,
        description: string,
        cve?: string,
        file?: File
    }
}
export type DecryptionContent = TextContent | VulnerabilityReportContent

export async function decryptMulti(ciphertext: string): Promise<DecryptionContent> {
    const plaintext = await timelockDecrypt(ciphertext)

    if (await vulnerabilityDecryptionSchema.isValid(plaintext)) {
        const vulnReport = await vulnerabilityDecryptionSchema.validate(plaintext)

        let file: File | undefined = undefined
        if (vulnReport.file) {
            const fileBuffer = Buffer.from(vulnReport.file, "base64")
            const extension = fileExtension(fileBuffer)
            file = new File([fileBuffer], `decrypted_vulnerability_report${extension}`)
        }

        return {
            type: "vulnerability_report",
            value: {
                title: vulnReport.title,
                description: vulnReport.description,
                cve: vulnReport.cve ?? undefined,
                file
            }
        }
    }

    return {
        type: "text",
        value: plaintext
    }
}
