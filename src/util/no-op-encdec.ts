import {Stanza} from "./age-encrypt";


const noOpType = "no-op"

class NoOpEncdec {
    static wrap(filekey: Uint8Array): Array<Stanza> {
        return [{
            type: noOpType,
            args: [],
            body: filekey
        }]
    }

    static unwrap(recipients: Array<Stanza>): Uint8Array {
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