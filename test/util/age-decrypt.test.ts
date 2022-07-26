import {expect} from "chai"
import {decryptAge} from "../../src/util/age-decrypt"
import {encryptAge} from "../../src/util/age-encrypt"

describe("AGE decryption", () => {
    it("can decrypt something that has been encrypted", () => {
        const helloWorld = "helloworld"
        const ciphertext = encryptAge(Buffer.from(helloWorld))
        
        expect(decryptAge(ciphertext)).to.deep.equal(helloWorld.toString())
    })
})