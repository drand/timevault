import * as chai from "chai"
import {expect} from "chai"
import chaiAsPromised from "chai-as-promised"
import chaiString from "chai-string"
import {decryptAge, encryptAge} from "../../src/age/age-encrypt-decrypt"

chai.use(chaiString)
chai.use(chaiAsPromised)

describe("age", () => {
    describe("encrypt", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))

        it("propagates errors from the decryptionWrapper", async () => {
            const expectedError = "boom"
            const encryptFun = async () => await encryptAge(Buffer.from(helloWorld), () => {
                throw Error(expectedError)
            })

            expect(encryptFun()).to.be.rejectedWith(expectedError)
        })
    })
    describe("decrypt", () => {
        const helloWorld = "helloworld"
        const helloWorldBytes = Buffer.from(helloWorld)

        it("can decrypt something that has been encrypted using ageEncrypt()", async () => {
            const encryptedPayload = await encryptAge(helloWorldBytes)

            expect(await decryptAge(encryptedPayload)).to.deep.equal(helloWorld)
        })

        it("propagates errors from the decryptionWrapper", async () => {
            const expectedError = "boom"
            const decryptFn = async () => decryptAge(await encryptAge(helloWorldBytes), async () => {
                throw Error(expectedError)
            })

            expect(decryptFn()).to.be.rejectedWith(expectedError)
        })

        it("should fail if the version header is unsupported", async () => {
            const invalidPayload = (await encryptAge(helloWorldBytes)).replace("age-encryption.org/v1", "some-fake-encryption.org/v1")
            expect(decryptAge(invalidPayload)).to.be.rejected
        })

        it("should fail if the mac doesn't verify", async () => {
            const invalidMacPayload = (await encryptAge(helloWorldBytes)).replace(/--- .*\n/, "--- soMeFakeMacHeader")
            expect(decryptAge(invalidMacPayload)).to.be.rejected
        })
    })
})
