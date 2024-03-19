import {bls12_381} from "@noble/curves/bls12-381"
import {sha256} from "@noble/hashes/sha256"
import {expect} from "chai"

// the new noble curves lib
describe("beacon", () => {
    it("should be compatible with the new noble curves lib", async () => {
        const beacon = {
            round: 19398585,
            randomness: '9ff50f8dd76a4c6a7e11f075b457bb95deb680c9a51eda6e81e471b4ede7869b',
            signature: 'af8695d75961338f379158022f24526203289a37ce94f29067f10b9f18db74f88ad189d0576d54f4b9b07f03195a0900191029ff7ff9a7db955ee381813a1f2875edc4a90151ffaf2e40f4106b9167b0a02e9507881e6b0028f09df236f838d2'
        }

        const publicKey = "8200fc249deb0148eb918d6e213980c5d01acd7fc251900d9260136da3b54836ce125172399ddc69c4e3e11429b62c11"
        const msg = hashedRoundNumber(beacon.round)
        expect(bls12_381.verify(beacon.signature, msg, publicKey)).to.be.true
    })
})

function hashedRoundNumber(round: number) {
    const roundNumberBuffer = Buffer.alloc(8);
    roundNumberBuffer.writeBigUInt64BE(BigInt(round));
    return sha256(roundNumberBuffer)
}