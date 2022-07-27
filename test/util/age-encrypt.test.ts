import * as chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {decryptAge, encryptAge} from "../../src/util/age-encrypt-decrypt"
import {constants} from "crypto";
import defaultCoreCipherList = module

chai.use(chaiString)

describe("age", () => {
    describe("encrypt", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))

        it("should have newlines for the version and mac", () => {
            const armor = encryptAge(helloWorld)
            expect(Array.from(armor.matchAll(/\n/g))).to.have.length(2)
        })

        it("should have an additional line for each recipient", () => {
            const recipients = [{
                type: "tlock",
                args: ["0", "abc"],
                body: helloWorld
            }, {
                type: "other-stuff",
                args: ["0", "abc"],
                body: helloWorld
            }]

            const armor = encryptAge(helloWorld, recipients)
            // newline for intro, mac = 2
            // additionally 4 more lines for recipients:
            // per recipient 1 for type and args, 1 for the payload
            expect(Array.from(armor.matchAll(/\n/g))).to.have.length(6)
        })

        it("recipients with long payloads have extra \n for each `maxColumns` characters", () => {
            // five hello worlds encode to a string longer than the default 64 column limit
            const fiveHelloWorlds = new Uint8Array(Buffer.from("hello world".repeat(5)))
            const recipients = [{
                type: "tlock",
                args: ["0", "abc"],
                body: fiveHelloWorlds
            }]

            const armor = encryptAge(helloWorld, recipients)
            // newline for intro and mac = 2
            // the recipient takes up 3 lines this time: 1 for type + args, and 2 for the larger payload
            expect(Array.from(armor.matchAll(/\n/g))).to.have.length(4)
        })
    })
    describe("decrypt", () => {
        it("should decrypt a payload that has been encrypted", () => {
            const plaintext = "hello world"
            const encodedPlaintext = Buffer.from(plaintext)
            const recipient = {type: "tlock", args: ["1", "deadbeef"], body: encodedPlaintext}
            const ciphertext = encryptAge(encodedPlaintext, [recipient])
            const allegedPlaintext = decryptAge(ciphertext, [recipient])

            expect(allegedPlaintext).to.equal(plaintext)
        })
    })
})
