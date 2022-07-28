import {Stanza} from "./age-encrypt-decrypt"

const noOpType = "no-op"

class NoOpEncdec {
    static async wrap(filekey: Uint8Array): Promise<Array<Stanza>> {
        return [{
            type: noOpType,
            args: [],
            body: filekey
        }]
    }

    static async unwrap(recipients: Array<Stanza>): Promise<Uint8Array> {
        if (recipients.length !== 1) {
            throw Error("NoOpEncDec only expects a single stanza!")
        }

        if (recipients[0].type !== noOpType) {
            throw Error(`NoOpEncDec expects the type of the stanza to be ${noOpType}`)
        }

        return recipients[0].body
    }
}

export {NoOpEncdec}