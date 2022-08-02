import {test} from "mocha"
import {expect} from "chai"
import {timelockDecrypt} from "../../src/drand/timelock"
import {MockDrandClient} from "./mock-drand-client"

test("payloads encrypted with the go impl should decrypt successfully", async () => {
    const validBeacon = {
        round: 1,
        randomness: "8430af445106a217c174b6265093d386bd3631ccb3dae833b5e645abbb281323",
        signature: "86ecea71376e78abd19aaf0ad52f462a6483626563b1023bd04815a7b953da888c74f5bf6ee672a5688603ab310026230522898f33f23a7de363c66f90ffd49ec77ebf7f6c1478a9ecd6e714b4d532ab43d044da0a16fed13b4791d7fc999e2b"
    }
    const mockClient = new MockDrandClient(validBeacon)
    const payloadFromGoImpl = "-----BEGIN AGE ENCRYPTED FILE-----\n" +
        "YWdlLWVuY3J5cHRpb24ub3JnL3YxCi0+IHRsb2NrIDYwNDMzNDAgNzY3Mjc5N2Y1\n" +
        "NDhmM2Y0NzQ4YWM0YmYzMzUyZmM2YzZiNjQ2OGM5YWQ0MGFkNDU2YTM5NzU0NWM2\n" +
        "ZTJkZjViZgpvVXhXNlRPL3ZnWFRTNkJwRWY1VDlBCi0tLSBpaVVqRkU4ZElJUE5y\n" +
        "RkkzVmxORnVpTGZiOS9tNktxL2hPemh1UHRlckljCs/rkvvzQZFk8uHwGGMkvYGT\n" +
        "G/IxlWeTWCMUTi0XYPhFwS4uKyJeqbR3HQU=\n" +
        "-----END AGE ENCRYPTED FILE-----\n"

    const plaintext = await timelockDecrypt(payloadFromGoImpl, mockClient)

    expect(plaintext).to.equal("hello world")
})
