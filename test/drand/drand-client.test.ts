import * as chai from "chai"
import {AssertionError, expect} from "chai"
import {defaultClientInfo, DrandHttpClient} from "../../src/drand/drand-client"
import chaiAsPromised from "chai-as-promised"

chai.use(chaiAsPromised)

describe("drand-client", () => {
    it("propagates errors from the fetch call", async () => {
        const expectedErrorMessage = "broken"
        const errorFetch = () => Promise.reject(expectedErrorMessage)
        const client = new DrandHttpClient(defaultClientInfo, {fetchJson: errorFetch})

        return expect(client.get(1)).to.be.rejectedWith(expectedErrorMessage)
    })

    it("returns an error if the randomness is not hex", async () => {
        const round = 1
        const responseJson = {round, randomness: "zzzzz", signature: "deadbeef"}
        const successFetch = () => Promise.resolve(responseJson)
        const client = new DrandHttpClient(defaultClientInfo, {fetchJson: successFetch})

        await assertError(() => client.get(round))
    })

    it("returns an error if the beacon is not hex", async () => {
        const round = 1
        const responseJson = {round, randomness: "deadbeef", signature: "zzzzzz"}
        const successFetch = () => Promise.resolve(responseJson)
        const client = new DrandHttpClient(defaultClientInfo, {fetchJson: successFetch})

        await assertError(() => client.get(round))
    })

    it("returns an error if the public key doesn't match the signer", async () => {
        const roundNumber = 2218895
        const nonMatchingPublicKey = "0000fc249deb0148eb918d6e213980c5d01acd7fc251900d9260136da3b54836ce125172399ddc69c4e3e11429b62c11"
        const json = {
            round: roundNumber,
            randomness: "15c445a2eb2dd6c1f835049cc2f20935afba2d84f9e5009a9eadb17ab85c3dad",
            signature: "8bf924c8e490b58125d8976d517598dd2c13baad96df75d75d6d575ad2c1b4a8193313f733e7e56b474ac009b8661ec301ba05def4e0fe95a2bf351ded9118c8db36efcc8f66e010f1b8fe15050fb6cc9c069a2bd5cabe20dfe4f8e3befb6c2a"
        }
        const successFetch = () => Promise.resolve(json)
        const client = new DrandHttpClient({
            ...defaultClientInfo,
            publicKey: nonMatchingPublicKey,
        }, {fetchJson: successFetch})


        await assertError(() => client.get(roundNumber))
    })

    it("returns an error if the signature does was not over the round number", async () => {
        const roundNumber = 2218895
        const json = {
            round: roundNumber,
            randomness: "15c445a2eb2dd6c1f835049cc2f20935afba2d84f9e5009a9eadb17ab85c3dad",
            // a non-matching signature
            signature: "00f924c8e490b58125d8976d517598dd2c13baad96df75d75d6d575ad2c1b4a8193313f733e7e56b474ac009b8661ec301ba05def4e0fe95a2bf351ded9118c8db36efcc8f66e010f1b8fe15050fb6cc9c069a2bd5cabe20dfe4f8e3befb6c2a"
        }
        const successFetch = () => Promise.resolve(json)
        const client = new DrandHttpClient(defaultClientInfo, {fetchJson: successFetch})

        await assertError(() => client.get(roundNumber))
    })

    it("succeeds if the signature matches the round number", async () => {
        const roundNumber = 2218895
        const json = {
            round: roundNumber,
            randomness: "15c445a2eb2dd6c1f835049cc2f20935afba2d84f9e5009a9eadb17ab85c3dad",
            signature: "8bf924c8e490b58125d8976d517598dd2c13baad96df75d75d6d575ad2c1b4a8193313f733e7e56b474ac009b8661ec301ba05def4e0fe95a2bf351ded9118c8db36efcc8f66e010f1b8fe15050fb6cc9c069a2bd5cabe20dfe4f8e3befb6c2a"
        }
        const successFetch = () => Promise.resolve(json)

        const client = new DrandHttpClient(defaultClientInfo, {fetchJson: successFetch})
        const result = await client.get(roundNumber)

        expect(result).deep.equal(json)
    })
})

async function assertError(fn: () => Promise<unknown>, message?: string): Promise<void> {
    let result = null
    try {
        result = await fn()
    } catch (err) {
        return
    }
    throw new AssertionError(message ?? `Expected error, but received ${result}`)
}
