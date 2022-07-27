import {test} from "mocha"
import {expect} from "chai"
import {STREAM} from "../../src/age/stream-cipher"

test("encryption with stream cipher can be decrypted", () => {
    const plaintext = new Uint8Array(22).fill(2)
    const key = new Uint8Array(32).fill(1)
    const sealed = STREAM.seal(plaintext, key)
    const opened = STREAM.open(sealed, key)

    expect(opened).deep.equals(opened)
})