import * as chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {decryptAge, encryptAge} from "../../src/age/age-encrypt-decrypt"

chai.use(chaiString)

describe("age", () => {
    describe("encrypt", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))

        it("should have newlines for the version, mac and two for the default encryption wrapper", () => {
            const encryptedPayload = encryptAge(helloWorld)
            expect(Array.from(encryptedPayload.matchAll(/\n/g))).to.have.length(4)
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

            const encryptedPayload = encryptAge(helloWorld, () => recipients)
            // newline for version, mac = 2
            // additionally 4 more lines for recipients:
            // per recipient 1 for type and args, 1 for the payload

            // sometimes the binary ciphertext actually contains a newline character... ffs
            const numberOfNewLines = Array.from(encryptedPayload.matchAll(/\n/g))
            expect(numberOfNewLines).to.have.length.greaterThanOrEqual(6)
            expect(numberOfNewLines).to.have.length.lessThanOrEqual(7)
        })

        it("propagates errors from the decryptionWrappoer", () => {
            const expectedError = "boom"
            const encryptFun = () => encryptAge(Buffer.from(helloWorld), () => {
                throw Error(expectedError)
            })

            expect(encryptFun).to.throw(expectedError)
        })
    })
    describe("decrypt", () => {
        const helloWorld = "helloworld"
        const helloWorldBytes = Buffer.from(helloWorld)

        it("can decrypt something that has been encrypted using ageEncrypt()", () => {
            const encryptedPayload = encryptAge(helloWorldBytes)

            expect(decryptAge(encryptedPayload)).to.deep.equal(helloWorld.toString())
        })

        it("propagates errors from the decryptionWrapper", () => {
            const expectedError = "boom"
            const decryptFn = () => decryptAge(encryptAge(helloWorldBytes), () => {
                throw Error(expectedError)
            })

            expect(decryptFn).to.throw(expectedError)
        })

        it("should fail if the version header is unsupported", () => {
            const invalidPayload = encryptAge(helloWorldBytes).replace("age-encryption.org/v1", "some-fake-encryption.org/v1")
            expect(() => decryptAge(invalidPayload)).to.throw()
        })

        it("should fail if the mac doesn't verify", () => {
            const invalidMacPayload = encryptAge(helloWorldBytes).replace(/--- .*\n/, "--- soMeFakeMacHeader")
            expect(() => decryptAge(invalidMacPayload)).to.throw()
        })
    })
})
