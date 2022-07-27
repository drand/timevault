import * as chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {decryptAge, encryptAge} from "../../src/age/age-encrypt-decrypt"

chai.use(chaiString)

describe("age", () => {
    describe("encrypt", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))

        it("propagates errors from the decryptionWrapper", () => {
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
