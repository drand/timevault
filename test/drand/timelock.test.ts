import * as chai from "chai"
import {expect} from "chai"
import chaiAsPromised from "chai-as-promised"
import {timelockDecrypt, timelockEncrypt} from "../../src/drand/timelock"
import {defaultClientInfo} from "../../src/drand/drand-client"
import {MockDrandClient} from "./mock-drand-client"

chai.use(chaiAsPromised)

describe("timelock", () => {
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
