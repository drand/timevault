const header = "-----BEGIN AGE ENCRYPTED FILE-----"
const footer = "-----END AGE ENCRYPTED FILE-----"

// takes some payload and encodes it as armor with the AGE armor headers in lines of size `chunkSize`
export function encodeArmor(input: string, chunkSize = 64): string {
    const base64Input = Buffer.from(input).toString("base64")
    const columnisedInput = chunked(base64Input, chunkSize).join("\n")

    // this case doesn't seem to be possible once base64 encoded, but it's in the spec
    let paddedFooter = footer
    if (columnisedInput.length > 0 && columnisedInput[columnisedInput.length - 1].length === 64) {
        paddedFooter = "\n" + footer
    }
    return `${header}\n${columnisedInput}\n${paddedFooter}\n`
}

// takes an armored payload and decodes it if it is an AGE armor payload
// and it satisfies some security properties
export function decodeArmor(armor: string, chunkSize = 64): string {
    armor = armor.trim()
    if (!armor.startsWith(header)) {
        throw Error(`Armor cannot be decoded if it does not start with a header! i.e. ${header}`)
    }
    // could end in a newline, let's strip it
    if (!armor.trimEnd().endsWith(footer)) {
        throw Error(`Armor cannot be decoded if it does not end with a footer! i.e. ${footer}`)
    }

    const base64Payload = armor.slice(header.length, armor.length - footer.length)
    const lines = base64Payload.split("\n")
    if (lines.some(line => line.length > chunkSize)) {
        throw Error(`Armor to decode cannot have lines longer than ${chunkSize} (configurable) in order to stop padding attacks`)
    }

    if (lines[lines.length - 1].length >= chunkSize) {
        throw Error(`The last line of an armored payload must be less than ${chunkSize} (configurable) to stop padding attacks`)
    }

    return Buffer.from(lines.join(""), "base64").toString("binary")
}

export function isProbablyArmored(input: string): boolean {
    return input.startsWith(header)
}

/*
    e.g. chunked("hello world", 2, ".") returns
    ["he.", "ll.", "o .", "wo.", "rl.", "d."]
 */
function chunked(input: string, chunkSize: number, suffix = ""): Array<string> {
    const output = []
    let currentChunk = ""
    for (let i = 0, chunks = 0; i < input.length; i++) {
        currentChunk += input[i]

        const posInChunk = i - (chunks * chunkSize)

        if (posInChunk === chunkSize - 1) {
            output.push(currentChunk + suffix)
            currentChunk = ""
            chunks++
        }
        if (i === input.length - 1) {
            output.push(currentChunk + suffix)
        }
    }

    return output
}
