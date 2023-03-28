import {roundTime} from "tlock-js"
import {MAINNET_CHAIN_INFO} from "tlock-js/drand/defaults"

export function errorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message
    }
    if (typeof err === "string") {
        return err
    }

    return "Unknown error"
}

// This takes an error thrown from decryption
// if the error is because decryption has been attempted too early, it remaps the message to tell the user when they can decrypt
// otherwise it just returns a generic error message, as some of the internal tlock error messages are a bit inscrutable to the end user
export function localisedDecryptionMessageOrDefault(err: unknown): string {
    const message = errorMessage(err)
    const tooEarlyToDecryptErrorMessage = "It's too early to decrypt the ciphertext - decryptable at round "

    if (!message.startsWith(tooEarlyToDecryptErrorMessage)) {
        return "There was an error during decryption! Is your ciphertext valid?"
    }

    const roundNumber = Number.parseInt(message.split(tooEarlyToDecryptErrorMessage)[1])
    const timeToDecryption = new Date(roundTime(MAINNET_CHAIN_INFO, roundNumber))
    return `This message cannot be decrypted until ${timeToDecryption.toLocaleDateString()} at ${timeToDecryption.toLocaleTimeString()}`
}
