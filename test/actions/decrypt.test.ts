import {describe} from "mocha"
import {assert, expect} from "chai"
import {encryptVulnerabilityReport} from "../../src/actions/encrypt-vulnerability-report"
import {decryptMulti} from "../../src/actions/decrypt-multi"
import {encryptedOrDecryptedFormData} from "../../src/actions/encrypt-text"

import "isomorphic-fetch"

describe("multi-decryption", () => {
    it("correctly identifies vulnerability reports", async () => {
        const report = {
            title: "something",
            description: "cool",
            cve: "1234",
            decryptionTime: Date.now()
        }
        const encryptedVulnerabilityReport = await encryptVulnerabilityReport("testnet", report)
        const result = await decryptMulti("testnet", encryptedVulnerabilityReport)

        expect(result.type).to.equal("vulnerability_report")
        assert(result.type === "vulnerability_report")
        expect(result.value.title).to.equal(report.title)
        expect(result.value.description).to.equal(report.description)
        expect(result.value.cve).to.equal(report.cve)
        expect(result.value.file).to.equal(undefined)
    }).timeout(5000)

    it("identifies non-vulnerability reports as text", async () => {
        const encryptionForm = {
            plaintext: "blah",
            decryptionTime: Date.now()
        }
        const {ciphertext} = await encryptedOrDecryptedFormData("testnet", encryptionForm)
        if (!ciphertext) {
            throw Error("Expected a ciphertext!")
        }

        const result = await decryptMulti("testnet", ciphertext)

        expect(result.type).to.equal("text")
        expect(result.value).to.equal(encryptionForm.plaintext)
    }).timeout(5000)
})
