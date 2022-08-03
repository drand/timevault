import {test} from "mocha"
import {expect} from "chai"
import {timelockDecrypt} from "../../src/drand/timelock"
import {MockDrandClient} from "./mock-drand-client"

test("payloads encrypted with the go impl should decrypt successfully", async () => {
    const validBeacon = {
        round: 2627830,
        randomness: "d6d843144ce19f63318048f2715cc17298ae6f2dfe982705c2e41a9f63e63b04",
        signature: "8f1385df2916a38f6146bdbc269d7492398621ba005e9188e7854bfd7269ac09299474d03d31e85a699f8b050a88805019502a5ea96762752207878753827c1ac51e6c1bacec96bff495d696226c6b485b68e076ac760b883732e3fd457ba197"
    }
    const mockClient = new MockDrandClient(validBeacon)
    const payloadFromGoImpl =  "-----BEGIN AGE ENCRYPTED FILE-----\n"+
    "YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IHRsb2NrIDI2Mjc4MzAgNzY3Mjc5N2Y1\n"+
    "NDhmM2Y0NzQ4YWM0YmYzMzUyZmM2YzZiNjQ2OGM5YWQ0MGFkNDU2YTM5NzU0NWM2\n"+
    "ZTJkZjViZgpncm1LcHZxdm1WL1FRNlhFbzNqbDlPWlZFb01OSTM3dCtZN3Y4MWV6\n"+
    "NDZpVS9QTnArOTVoNEFnamltclFBYnlCCmtQdmwvZGZYdmtYVHNNbmYrcnhPRVQz\n"+
    "WVpFdlhCeXVLNU1mVlB0VFBwWW8KLS0tIEdnV3dQSllaTFpPZEtpZDBPVWxVZXAv\n"+
    "YnpzL3k0d1VaV1JkZzc3bytLVGcKSsSWLbyYFCCbm6NSBPD/wwhFIFWww5+BjsEN\n"+
    "CIokjx+3bwBtmvqMXpKgB4U=\n"+
    "-----END AGE ENCRYPTED FILE-----"

    const plaintext = await timelockDecrypt(payloadFromGoImpl, mockClient)

    expect(plaintext).to.equal("Hello World")
})
