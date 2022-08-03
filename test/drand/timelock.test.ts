import * as chai from "chai"
import {expect} from "chai"
import {createTimelockDecrypter, timelockDecrypt, timelockEncrypt} from "../../src/drand/timelock"
import {defaultClientInfo} from "../../src/drand/drand-client"
import {readAge} from "../../src/age/age-reader-writer"
import chaiAsPromised from "chai-as-promised"
import {decodeArmor} from "../../src/age/armor"
import {MockDrandClient} from "../age/mock-drand-client"

chai.use(chaiAsPromised)

describe("timelock", () => {
    describe("encryption", () => {
        it("should fail for roundNumber less than 0", async () => {
            await expect(timelockEncrypt(defaultClientInfo, -1, "hello world")).to.be.rejectedWith()
        })
        it("should pass for a valid roundNumber", async () => {
            await expect(timelockEncrypt(defaultClientInfo, 1, "hello world")).not.to.be.rejectedWith()
        })
    })

    describe("decryption", () => {
        const validBeacon = {
            round: 1,
            randomness: "8430af445106a217c174b6265093d386bd3631ccb3dae833b5e645abbb281323",
            signature: "86ecea71376e78abd19aaf0ad52f462a6483626563b1023bd04815a7b953da888c74f5bf6ee672a5688603ab310026230522898f33f23a7de363c66f90ffd49ec77ebf7f6c1478a9ecd6e714b4d532ab43d044da0a16fed13b4791d7fc999e2b"
        }
        const mockClient = new MockDrandClient(validBeacon)
        it("should succeed for a correctly timelock encrypted payload", async () => {
            const plaintext = "hello world"
            const decryptedPayload = await timelockDecrypt(await timelockEncrypt(defaultClientInfo, 1, plaintext, mockClient), mockClient)

            expect(decryptedPayload).to.equal(plaintext)
        })
    })

    describe("timelock decrypter", () => {
        const validBeacon = {
            round: 1,
            randomness: "8430af445106a217c174b6265093d386bd3631ccb3dae833b5e645abbb281323",
            signature: "86ecea71376e78abd19aaf0ad52f462a6483626563b1023bd04815a7b953da888c74f5bf6ee672a5688603ab310026230522898f33f23a7de363c66f90ffd49ec77ebf7f6c1478a9ecd6e714b4d532ab43d044da0a16fed13b4791d7fc999e2b"
        }

        const mockClient = new MockDrandClient(validBeacon)

        it("should decrypt for stanzas created using tlock", async () => {
            const plaintext = "hello world"
            const ciphertext = await timelockEncrypt(defaultClientInfo, 1, plaintext, mockClient)
            const parsedAgeEncryption = readAge(decodeArmor(ciphertext))

            const decryptedFileKey = await createTimelockDecrypter(mockClient)(parsedAgeEncryption.header.recipients)
            expect(decryptedFileKey.length).to.be.greaterThan(0)
        })

        it("should throw an error if multiple recipient stanzas are provided", () => {
            const stanza = {
                type: "tlock",
                args: ["1", "deadbeef"],
                body: Buffer.from("deadbeef")
            }
            expect(createTimelockDecrypter(mockClient)([stanza, stanza])).to.be.rejectedWith()
        })

        it("should blow up if the stanza type isn't 'tlock'", () => {
            const stanza = {
                type: "unsupported-type",
                args: ["1", "deadbeef"],
                body: Buffer.from("deadbeef")
            }
            expect(createTimelockDecrypter(mockClient)([stanza, stanza])).to.be.rejectedWith()
        })

        it("should blow up if roundNumber or chainHash are missing from the args of the stanza", () => {
            const missingChainHash = {
                type: "tlock",
                args: ["1"],
                body: Buffer.from("deadbeef")
            }
            const missingRoundNumber = {
                type: "tlock",
                args: ["deadbeef"],
                body: Buffer.from("deadbeef")
            }
            expect(createTimelockDecrypter(mockClient)([missingChainHash])).to.be.rejectedWith()
            expect(createTimelockDecrypter(mockClient)([missingRoundNumber])).to.be.rejectedWith()
        })

        it("should blow up if the roundNumber isn't a number", () => {
            const invalidRoundNumberArg = {
                type: "tlock",
                args: ["shouldbeanum", "deadbeef"],
                body: Buffer.from("deadbeef")
            }
            expect(createTimelockDecrypter(mockClient)([invalidRoundNumberArg])).to.be.rejectedWith()
        })

        it("should blow up if the chainHash isn't hex", () => {
            const invalidChainHashArg = {
                type: "tlock",
                args: ["1", "not just hex chars"],
                body: Buffer.from("deadbeef")
            }
            expect(createTimelockDecrypter(mockClient)([invalidChainHashArg])).to.be.rejectedWith()
        })
    })
})
