import {Fp, Fp2, Fp12} from '@noble/bls12-381'
import {expect} from "chai"
import {fp12ToBytes, fp2ToBytes, fpToBytes} from "../src/crypto/ibe"
import { blake2s } from '@noble/hashes/blake2s';

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

    it("big nums should not lose precision", () => {
        // a number with more than 64bits
        const buffer = Buffer.from("ffffffffff", "hex")
        // the same value as a `bigint`
        const bytes = fpToBytes(new Fp(1099511627775n))

        expect(Buffer.compare(buffer, bytes)).to.equal(0)
    })

    it("correctly pass the test vectors generated from the go codebase", () => {
        const test = Fp12.fromTuple([
            BigInt("0x0f41e58663bf08cf068672cbd01a7ec73baca4d72ca93544deff686bfd6df543d48eaa24afe47e1efde449383b676631"),
            BigInt("0x04c581234d086a9902249b64728ffd21a189e87935a954051c7cdba7b3872629a4fafc05066245cb9108f0242d0fe3ef"),
            BigInt("0x03350f55a7aefcd3c31b4fcb6ce5771cc6a0e9786ab5973320c806ad360829107ba810c5a09ffdd9be2291a0c25a99a2"),
            BigInt("0x11b8b424cd48bf38fcef68083b0b0ec5c81a93b330ee1a677d0d15ff7b984e8978ef48881e32fac91b93b47333e2ba57"),
            BigInt("0x06fba23eb7c5af0d9f80940ca771b6ffd5857baaf222eb95a7d2809d61bfe02e1bfd1b68ff02f0b8102ae1c2d5d5ab1a"),
            BigInt("0x19f26337d205fb469cd6bd15c3d5a04dc88784fbb3d0b2dbdea54d43b2b73f2cbb12d58386a8703e0f948226e47ee89d"),
            BigInt("0x018107154f25a764bd3c79937a45b84546da634b8f6be14a8061e55cceba478b23f7dacaa35c8ca78beae9624045b4b6"),
            BigInt("0x01b2f522473d171391125ba84dc4007cfbf2f8da752f7c74185203fcca589ac719c34dffbbaad8431dad1c1fb597aaa5"),
            BigInt("0x193502b86edb8857c273fa075a50512937e0794e1e65a7617c90d8bd66065b1fffe51d7a579973b1315021ec3c19934f"),
            BigInt("0x1368bb445c7c2d209703f239689ce34c0378a68e72a6b3b216da0e22a5031b54ddff57309396b38c881c4c849ec23e87"),
            BigInt("0x089a1c5b46e5110b86750ec6a532348868a84045483c92b7af5af689452eafabf1a8943e50439f1d59882a98eaa0170f"),
            BigInt("0x1250ebd871fc0a92a7b2d83168d0d727272d441befa15c503dd8e90ce98db3e7b6d194f60839c508a84305aaca1789b6")
        ])

        const expectedOutput = "0f41e58663bf08cf068672cbd01a7ec73baca4d72ca93544deff686bfd6df543d48eaa24afe47e1efde449383b67663104c581234d086a9902249b64728ffd21a189e87935a954051c7cdba7b3872629a4fafc05066245cb9108f0242d0fe3ef03350f55a7aefcd3c31b4fcb6ce5771cc6a0e9786ab5973320c806ad360829107ba810c5a09ffdd9be2291a0c25a99a211b8b424cd48bf38fcef68083b0b0ec5c81a93b330ee1a677d0d15ff7b984e8978ef48881e32fac91b93b47333e2ba5706fba23eb7c5af0d9f80940ca771b6ffd5857baaf222eb95a7d2809d61bfe02e1bfd1b68ff02f0b8102ae1c2d5d5ab1a19f26337d205fb469cd6bd15c3d5a04dc88784fbb3d0b2dbdea54d43b2b73f2cbb12d58386a8703e0f948226e47ee89d018107154f25a764bd3c79937a45b84546da634b8f6be14a8061e55cceba478b23f7dacaa35c8ca78beae9624045b4b601b2f522473d171391125ba84dc4007cfbf2f8da752f7c74185203fcca589ac719c34dffbbaad8431dad1c1fb597aaa5193502b86edb8857c273fa075a50512937e0794e1e65a7617c90d8bd66065b1fffe51d7a579973b1315021ec3c19934f1368bb445c7c2d209703f239689ce34c0378a68e72a6b3b216da0e22a5031b54ddff57309396b38c881c4c849ec23e87089a1c5b46e5110b86750ec6a532348868a84045483c92b7af5af689452eafabf1a8943e50439f1d59882a98eaa0170f1250ebd871fc0a92a7b2d83168d0d727272d441befa15c503dd8e90ce98db3e7b6d194f60839c508a84305aaca1789b6"
        expect(Buffer.from(fp12ToBytes(test)).toString("hex")).to.equal(expectedOutput)

        const expectedAdded = "0482b9228dfe2b03c1f13de15ce950b712e1fe2965cd57ca56cdfe37042af4638a71544aae74fc3e41c9927076cf21b7098b02469a10d532044936c8e51ffa434313d0f26b52a80a38f9b74f670e4c5349f5f80a0cc48b972211e0485a1fc7de066a1eab4f5df9a786369f96d9caee398d41d2f0d56b2e6641900d5a6c105220f750218b413ffbb37c45234184b533440970565f611197d7aec3285a32ca70b42bbddbe16e57220f92e9595e007fa6eed33291118b11f5927d2868e667c5ca030df7447d6f8b5e1b3f0128194ee36dffab0af755e445d72b4fa5013ac37fc05c37fa36d1fe05e1702055c385abab563419e3b4856a8c0ff2ee91d275445f93c42c97be72741c52f85619c7e66ebd88355779ab085bfce07c652a044dc8fe268f03020e2a9e4b4ec97a78f326f48b708a8db4c6971ed7c29500c3cab99d748f1647efb59546b9194f17d5d2c4808b696c0365ea448e7a2e272224b7509b8800f9f7e5f1b4ea5ef8e830a407f994b1358e33869bff7755b0863b5a383f6b2f554a1868f386a4372a1539cc4c587154f57b0b49a71749463c0391f0ded9d55bc01be11e3af5fddee762a8a143d878337bf30cd0649e7f7873a6e2ec3cbc8dee19c0a27a0197f1c854a4c68349a4535540859d52ae6275d96719563999093d84d263113438b68dca22170cea1d8d4a646910d150808a9079256f5eb5ed128a5d5f57e351287ca0873e3ab3105531d5402e1e0aa0c5c6aa782e8b044a08ac8e560176e9e33cb2ebbda5e11480ff78dc6a71ab4ef729ed5f1f8a1196870b55942f68c1"
        expect(Buffer.from(fp12ToBytes(test.add(test))).toString("hex")).to.equal(expectedAdded)
    })
})