import chai from "chai"
import {expect} from "chai"
import chaiString from "chai-string"
import {armorify} from "../../src/util/armor"

chai.use(chaiString)

describe("armor", () => {
    it("should encode input as base64", () => {
        const armor = armorify("hello world")
        // created using `echo hello world | base64`
        // omitted a final character that depends
        // on whether there is a \n or not after it
        expect(armor).to.contain("aGVsbG8gd29ybGQ=")
    })
    it("should add a newline every 64 characters", () => {
        // five hello worlds encode to a string longer than the default 64 column limit
        const fiveHelloWorlds = "hello world".repeat(5)
        const armor = armorify(fiveHelloWorlds)
        // newline for header, footer, and two for the longer payload = 4
        expect(Array.from(armor.matchAll(/\n/g))).to.have.length(4)
    })

    it("should add an additional newline if the input has a length that is exactly a multiple of 64", () => {
        // ... this is in the spec but I can't seem to create a base64 string that's a multiple of 64 o.O
    })

    it("should add a newline at the end of the footer", () => {
        const armor = armorify("hello world")
        expect(armor).to.endWith("END AGE ENCRYPTED FILE-----\n")
    })
})