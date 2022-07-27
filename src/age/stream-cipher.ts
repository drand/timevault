// stolen from https://github.com/paulmillr/jage
// STREAM cipher
// https://eprint.iacr.org/2015/189.pdf
// There are NO js libraries right now.
// miscreant.js implements STREAM, but it doesn"t support chacha
// https://github.com/miscreant/miscreant.js
// TODO: browser version
//
// age spec:
// After the header the binary payload is nonce || STREAM[HKDF[nonce, "payload"](file key)](plaintext) where nonce is random(16) and STREAM is from Online Authenticated-Encryption and its Nonce-Reuse Misuse-Resistance with ChaCha20-Poly1305 in 64KiB chunks and a nonce structure of 11 bytes of big endian counter, and 1 byte of last block flag (0x00 / 0x01). (The STREAM scheme is similar to the one Tink and Miscreant use, but without nonce prefix as we use HKDF, and with ChaCha20-Poly1305 instead of AES-GCM because the latter is unreasonably hard to do well or fast without hardware support.)
import * as crypto from "crypto"

const CHUNK_SIZE = 64 * 1024; // 64 KiB
const TAG_SIZE = 16; // Poly1305 MAC size
const ENCRYPTED_CHUNK_SIZE = CHUNK_SIZE + TAG_SIZE
const NONCE_SIZE = 11; // STREAM nonce size

type ui8a = Uint8Array

export class STREAM {
    static seal(plaintext: ui8a, privateKey: ui8a): Uint8Array {
        const stream = new STREAM(privateKey)
        const chunks = Math.ceil(plaintext.length / CHUNK_SIZE)
        const ciphertext = new Uint8Array(plaintext.length + (chunks * TAG_SIZE))

        for (let chunk64kb = 1; chunk64kb <= chunks; chunk64kb++) {
            const start = chunk64kb - 1
            const end = chunk64kb
            const isLast = chunk64kb === chunks
            const input = plaintext.slice(start * CHUNK_SIZE, end * CHUNK_SIZE)
            const output = ciphertext.subarray(start * ENCRYPTED_CHUNK_SIZE, end * ENCRYPTED_CHUNK_SIZE)
            stream.encryptChunk(input, isLast, output)
        }
        stream.clear()
        return ciphertext
    }

    static open(ciphertext: ui8a, privateKey: ui8a) {
        const stream = new STREAM(privateKey)
        const chunks = Math.ceil(ciphertext.length / ENCRYPTED_CHUNK_SIZE)
        const plaintext = new Uint8Array(ciphertext.length - (chunks * TAG_SIZE))

        for (let chunk64kb = 1; chunk64kb <= chunks; chunk64kb++) {
            const start = chunk64kb - 1
            const end = chunk64kb
            const isLast = chunk64kb === chunks
            const input = ciphertext.slice(start * ENCRYPTED_CHUNK_SIZE, end * ENCRYPTED_CHUNK_SIZE)
            const output = plaintext.subarray(start * CHUNK_SIZE, end * CHUNK_SIZE)
            stream.decryptChunk(input, isLast, output)
        }
        stream.clear()
        return plaintext
    }

    key: ui8a
    nonce: ui8a
    nonceView: DataView
    counter: number

    constructor(key: ui8a) {
        this.key = key.slice()
        this.nonce = new Uint8Array(NONCE_SIZE + 1)
        this.nonceView = new DataView(this.nonce.buffer)
        this.counter = 0
    }

    encryptChunk(chunk: ui8a, isLast: boolean, output: ui8a) {
        if (chunk.length > CHUNK_SIZE) throw new Error("Chunk is too big")
        if (this.nonce[11] === 1) throw new Error("Last chunk has been processed")
        if (isLast) this.nonce[11] = 1
        const ciphertext = ChaCha20Poly1305.encrypt(this.key, chunk, this.nonce)
        output.set(ciphertext)
        this.incrementCounter()
    }

    decryptChunk(chunk: ui8a, isLast: boolean, output: ui8a) {
        if (chunk.length > ENCRYPTED_CHUNK_SIZE) throw new Error("Chunk is too big")
        if (this.nonce[11] === 1) throw new Error("Last chunk has been processed")
        if (isLast) this.nonce[11] = 1
        const plaintext = ChaCha20Poly1305.decrypt(this.key, chunk, this.nonce)
        output.set(plaintext)
        this.incrementCounter()
    }

    // Increments Big Endian Uint8Array-based counter.
    // [0, 0, 0] => [0, 0, 1] ... => [0, 0, 255] => [0, 1, 0]
    incrementCounter() {
        this.counter += 1
        this.nonceView.setUint32(7, this.counter, false)
    }

    clear() {
        function clear(arr: ui8a) {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = 0
            }
        }

        clear(this.key)
        clear(this.nonce)
        this.counter = 0
    }
}

// ChaCha20-Poly1305 from RFC 7539.
const CHACHA_NAME = "chacha20-poly1305"
const CNS = 12; // chacha nonce size
export class ChaCha20Poly1305 {
    static encrypt(privateKey: ui8a, plaintext: ui8a, nonce: ui8a = new Uint8Array(CNS)): ui8a {
        const cipher = crypto.createCipheriv(CHACHA_NAME, privateKey, nonce, {authTagLength: TAG_SIZE})
        const head = cipher.update(plaintext)
        const final = cipher.final()
        const tag = cipher.getAuthTag()
        const ciphertext = Buffer.concat([tag, head, final])
        return new Uint8Array(ciphertext)
    }

    static decrypt(privateKey: ui8a, ciphertext: ui8a, nonce: ui8a = new Uint8Array(CNS)): ui8a {
        const decipher = crypto.createDecipheriv(CHACHA_NAME, privateKey, nonce, {authTagLength: TAG_SIZE})
        // Tag is first 16 bytes. The other part is ciphertext.
        const tag = ciphertext.slice(0, TAG_SIZE)
        decipher.setAuthTag(tag)
        const plaintext = decipher.update(ciphertext.slice(TAG_SIZE))
        const final = decipher.final()
        const res = Buffer.concat([plaintext, final])
        return new Uint8Array(res)
    }
}