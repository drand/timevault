import {Fp, Fp2, Fp12} from '@noble/bls12-381';
import {fp12ToBytes, fp2ToBytes, fpToBytes} from "../src/crypto/ibe"
import {expect} from "chai"

describe("fpToBytes", () => {
    it("two Fps should combine into one", () => {
        const combined = Buffer.concat([fpToBytes(new Fp(1n)), fpToBytes(new Fp(2n))])
        const fp2 = fp2ToBytes(new Fp2([1n, 2n]))
        expect(Buffer.compare(fp2, combined)).to.equal(0)
    })

    it("lots of Fp2s should combine to an Fp12", () => {
        const fullFp12 = fp12ToBytes(Fp12.fromTuple([1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n]))
        const one = fp2ToBytes(new Fp2([1n, 2n]))
        const two = fp2ToBytes(new Fp2([3n, 4n]))
        const three = fp2ToBytes(new Fp2([5n, 6n]))
        const four = fp2ToBytes(new Fp2([7n, 8n]))
        const five = fp2ToBytes(new Fp2([9n, 10n]))
        const six = fp2ToBytes(new Fp2([11n, 12n]))
        const combined = Buffer.concat([one, two, three, four, five, six])

        expect(Buffer.compare(fullFp12, combined)).to.equal(0)
    })
})