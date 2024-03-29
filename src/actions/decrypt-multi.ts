import {HttpChainClient, timelockDecrypt} from "tlock-js"
import {vulnerabilityDecryptionSchema} from "../schema/vulnerability-encryption-schema"
import {Network} from "../App"
import {fastnet, quicknet, testnetQuicknet, testnetUnchained} from "./client-utils"

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

export async function decryptMulti(network: Network, ciphertext: string): Promise<DecryptionContent> {
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

    const buf = await timelockDecrypt(ciphertext, client)
    const plaintext = buf.toString()

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
        value: plaintext.toString()
    }
}
