import {timelockDecrypt} from "tlock-js"
import {vulnerabilityDecryptionSchema} from "../schema/vulnerability-encryption-schema"

type TextContent = { type: "text", value: string }
export type VulnerabilityReportContent = {
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
            const fileBuffer = Buffer.from(vulnReport.file.content, "base64")
            file = new File([fileBuffer], vulnReport.file.name)
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
