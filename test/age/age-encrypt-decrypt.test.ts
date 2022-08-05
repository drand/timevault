import * as chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {decryptAge, encryptAge} from "../../src/age/age-encrypt-decrypt"
import {assertError, assertErrorMessage} from "../utils"

chai.use(chaiString)

describe("age", () => {
    describe("encrypt", () => {
        const helloWorld = new Uint8Array(Buffer.from("hello world"))

        it("propagates errors from the decryptionWrapper", async () => {
            const expectedError = "boom"
            const encryptFun = async () => await encryptAge(Buffer.from(helloWorld), () => {
                throw Error(expectedError)
            })

            await assertErrorMessage(() => encryptFun(), expectedError)
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

            await assertErrorMessage(() => decryptFn(), expectedError)
        })

        it("should fail if the version header is unsupported", async () => {
            const invalidPayload = (await encryptAge(helloWorldBytes)).replace("age-encryption.org/v1", "some-fake-encryption.org/v1")

            await assertError(() => decryptAge(invalidPayload))
        })

        it("should fail if the mac doesn't verify", async () => {
            const invalidMacPayload = (await encryptAge(helloWorldBytes)).replace(/--- .*\n/, "--- soMeFakeMacHeader")

            await assertError(() => decryptAge(invalidMacPayload))
        })

        it("should work for big payloads too", async () => {
            const bigPayload = "YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IHRsb2NrIDI2NTUxMjcgNzY3Mjc5N2Y1\n" +
                "NDhmM2Y0NzQ4YWM0YmYzMzUyZmM2YzZiNjQ2OGM5YWQ0MGFkNDU2YTM5NzU0NWM2\n" +
                "ZTJkZjViZgprbUtMbm83UVdwUnI4K3dwaWxQejkySEVJZ245U0FPcnF2UXZXejlZ\n" +
                "K2xoN09xSkxlaFExVlJkKzJZSjF5RDBICkhNQk5aa3pOV0JkdW1OUURwZ1RjR3Z3\n" +
                "VEJKdHIyNFlEUEcrTzcwcjcvWjAKLS0tIHFsU3kwTDJ3L1NyMit4YWIrMzZUd251\n" +
                "cnJnUHRFWWx3UW41ZkZER05MOFkKgjThUJfYAKIjliXAAoIfDBafokRDA32V37WZ\n" +
                "Ap6fItGwCMHYhsHGQROGTyQeQn63Wqx+afVjXgcnKADLMhJrAkNA5+uXpqlFiLZ5\n" +
                "sF+fSrdJ7d+FsC6RoZpZbdTYnL55RlttbdcmgWgAxWqFIThq7cnghSFmp+KYD1gO\n" +
                "aWDQ4mrHmw8bkhVCQN3W7lKgHPol91gqBsBdyjJC/fPi3Pbm5pMXzLtVqsTWAloj\n" +
                "1mgKecbhaiQZrKck6BfeCQZygrMTMcX7pcOM9xkZVWeuqsSLjfyvv7y5i10WXt3M\n" +
                "/fC/9ot7+dsoqXWpoQ5UZlSlEt0IAf0uaaX3T2T/6lyrD82CSpBWAWllI2+lwjXp\n" +
                "UqkeMWPY//Fcblo15vrivKCrC+QQQSunMZlI0Gf6aZIHo5B/Zuw+zdQMjez5ZDVw\n" +
                "FNTeF10Y2VwQihNnc0Rgn9v2O213pRNXSZjT80zZ6udR/PEAqilvkKqU4yW3dSzC\n" +
                "9HGlJWYxYPB3LILK74XLp5KVlYcT0GTmF/hSIooirkKmuQWE/Lfv9OWpikAGcTEa\n" +
                "S55oOWth8jDerT9/hMgi5Oq2DiHOGp1yGhwBxqvuecA5M6ce1jKj0Yq2h8qeRVQq\n" +
                "kaTYQUN1ElX2bFZQyxefmLq9iD3j77qijPLIdeRTVq+ueywZt57ANOcldAJtNA9B\n" +
                "fr6M4kzNZKx5sMHYK9XMwNJEXzKkhTnVUpewwM83knpT4ddIZBQmBklo1vUhleVW\n" +
                "LQiXfkczGF/uTF0RMu/nysd2v/CBVPS6jdmuZHPtqq2XSG95P/dMP4KjaizAbfxm\n" +
                "CO4/sybGyyEGGB/A0JTJVXW1bWhOBXrSR0U="

            const ciphertext = await encryptAge(Buffer.from(bigPayload))
            const result = await decryptAge(ciphertext)
            expect(result).to.equal(bigPayload)
        })
    })
})
