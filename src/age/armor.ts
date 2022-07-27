const header = "-----BEGIN AGE ENCRYPTED FILE-----"
const footer = "-----END AGE ENCRYPTED FILE-----"

export function armorify(input: string): string {
    const base64Input = Buffer.from(input).toString("base64")
    const columnisedInput = chunked(base64Input, 64).join("\n")

    // this case doesn't seem to be possible once base64 encoded, but it's in the spec
    let paddedFooter = footer
    if (columnisedInput.length > 0 && columnisedInput[columnisedInput.length - 1].length === 64) {
        paddedFooter = "\n" + footer
    }
    return `${header}\n${columnisedInput}\n${paddedFooter}\n`
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
