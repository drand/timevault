import * as chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {encodeArmor} from "../../src/util/armor"

chai.use(chaiString)

describe("armor", () => {
    describe("encode", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))
        const someRecipient = {
            type: "tlock",
            args: [
                "2304918", // roundNumber
                "7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf", // chainHash
            ],
            body: new Uint8Array(Buffer.from("some cool timelock ciphertext")), // encrypted payload
        }
        const armor = encodeArmor("AGE ENCRYPTED", helloWorld, [someRecipient])

        it("should contain the correct header", () => {
            expect(armor).to.startWith("-----BEGIN AGE ENCRYPTED FILE-----")
        })

        it("should contain the correct footer", () => {
            expect(armor).to.contain("-----END AGE ENCRYPTED FILE-----")
        })

        it("should end with a newline", () => {
            expect(armor).to.endWith("\n")
        })

        it("should contain the correct base64", () => {
            // created using `echo hello world | base64`
            // omitted a final character that depends
            // on whether there is a \n or not after it
            expect(armor).to.contain("aGVsbG8gd29ybGQ")
        })

        it("should have multiple newlines for longer payloads", () => {
            const fiveHelloWorlds = new Uint8Array(Buffer.from("hello world".repeat(5)))
            const armor = encodeArmor("AGE ENCRYPTED", fiveHelloWorlds)
            // newline for header, intro, mac, footer, and two for the longer payload
            expect(Array.from(armor.matchAll(/\n/g))).to.have.length(6)
        })

        it("should have an additional line for each recipient", () => {

        })
    })
})