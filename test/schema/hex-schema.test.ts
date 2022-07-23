import {expect} from "chai"
import {hexSchema} from "../../src/schema/hex-schema"

describe("hexSchema", () => {
    it("works for valid hex strings", () => {
        hexSchema.validateSync("0")
        hexSchema.validateSync("9")
        hexSchema.validateSync("0901234")
        hexSchema.validateSync("a")
        hexSchema.validateSync("deadbeef")
        hexSchema.validateSync("deadb33f")
        hexSchema.validateSync("deadb33f0")
    })

    it("blows up for invalid hex strings", () => {
        expect(() => hexSchema.validateSync("g1")).throws()
        expect(() => hexSchema.validateSync("///")).throws()
        expect(() => hexSchema.validateSync(".")).throws()
    })

    it("blows up for empty or spacey string", () => {
        expect(() => hexSchema.validateSync("")).throws()
        expect(() => hexSchema.validateSync("   ")).throws()
    })

    it("outputs only lower case strings", () => {
        const input = "0a0A0a0A"
        const expectedValue = "0a0a0a0a"
        expect(hexSchema.validateSync(input)).equals(expectedValue)
    })
})
