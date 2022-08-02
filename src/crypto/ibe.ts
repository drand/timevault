import * as bls from '@noble/bls12-381';
import {Fp, Fp2, Fp12, PointG1, PointG2, utils} from '@noble/bls12-381';
import {sha256} from "@noble/hashes/sha256"
import {blake2s} from '@noble/hashes/blake2s';

export interface Ciphertext {
    U: PointG1;
    V: Uint8Array;
    W: Uint8Array;
  }
  
export async function encrypt(master: PointG1, ID: Uint8Array, msg: Uint8Array): Promise<Ciphertext> {
    if (msg.length>>16 > 0) {
        // we're using blake2 as XOF which only outputs at most 2^16-1 bytes
        throw new Error("cannot encrypt messages larger than 2^16-1 bytes.");
    }


    // 1. Compute Gid = e(master,Q_id)
    const Qid = await bls.PointG2.hashToCurve(ID);
    const Gid = bls.pairing(master, Qid);

    // 2. Derive random sigma
    const sigma = utils.randomBytes(msg.length);

    // 3. Derive r from sigma and msg and get a field element
    const r = h3(sigma, msg);
    const U = bls.PointG1.BASE.multiply(r);

    // 5. Compute V = sigma XOR H2(rGid)
    const rGid = Gid.multiply(r);
    const hrGid = await gtToHash(rGid, msg.length)

    const V = xor(sigma, hrGid)

    // 6. Compute M XOR H(sigma)
    const hsigma = h4(sigma, msg.length)

    const W = xor(msg, hsigma)

    return {
     	U: U,
     	V: V,
     	W: W,
     }
}

export async function decrypt(p: PointG2, c: Ciphertext): Promise<Uint8Array> {
    // 1. Compute sigma = V XOR H2(e(rP,private))
    const gidt = bls.pairing(c.U, p)
 	const hgidt = gtToHash(gidt, c.W.length)

 	if (hgidt.length != c.V.length) {
        throw new Error("XorSigma is of invalid length")
 	}
    const sigma = xor(hgidt, c.V)

	// 2. Compute M = W XOR H4(sigma)
    const hsigma = h4(sigma, c.W.length)

    const msg = xor(hsigma, c.W)

    // 	3. Check U = rP
    const r = h3(sigma, msg)
    const rP =  bls.PointG1.BASE.multiply(r)
    if (!rP.equals(c.U)) {
        throw new Error("invalid proof: rP check failed")
 	}
 	return msg
}

function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
    if (a.length != b.length) {
        throw new Error("Error: incompatible sizes");
    }

    const ret = new Uint8Array(a.length);

    for (let i = 0; i < a.length; i++) {
        ret[i] = a[i] ^ b[i];
    }

    return ret;
}


////// code from Noble: 
////// https://github.com/paulmillr/noble-bls12-381/blob/6380415f1b7e5078c8883a5d8d687f2dd3bff6c2/index.ts#L132-L145
function bytesToNumberBE(uint8a: Uint8Array): bigint {
    if (!(uint8a instanceof Uint8Array)) throw new Error('Expected Uint8Array');
    return BigInt('0x' + bytesToHex(Uint8Array.from(uint8a)));
}

const hexes = Array.from({length: 256}, (v, i) => i.toString(16).padStart(2, '0'));

function bytesToHex(uint8a: Uint8Array): string {
// pre-caching chars could speed this up 6x.
    let hex = '';
    for (let i = 0; i < uint8a.length; i++) {
        hex += hexes[uint8a[i]];
    }
    return hex;
}
////// end of code from Noble.


// Our IBE hashes
const BitsToMaskForBLS12381 = 1;

// we are hashing the data until we get a value smaller than the curve order
function toField(h3ret: Uint8Array) {
    let data = h3ret;
    // assuming Big Endianness
    data[0] = data[0] >> BitsToMaskForBLS12381;
    let n: bigint = bytesToNumberBE(data);
    while (n <= 0 || n > bls.CURVE.r) {
        data = sha256(data);
        data[0] = data[0] >> BitsToMaskForBLS12381;
        n = bytesToNumberBE(data);
    }

    return n
}

// maxSize used for our Blake2s XOF output.
const maxSize = 1 << 10;
function gtToHash(gt: bls.Fp12, len: number): Uint8Array {
    const b2params = {dkLen: maxSize};

    const hgtret = blake2s
        .create(b2params)
        .update("IBE-H2")
        .update(fp12ToBytes(gt))
        .digest();

    return hgtret.slice(0, len)
}

function h3(sigma: Uint8Array, msg: Uint8Array) {
    const b2params = {dkLen: 32};
    const h3ret = blake2s
        .create(b2params)
        .update("IBE-H3")
        .update(sigma)
        .update(msg)
        .digest();

    const ret = toField(h3ret);
    return ret
}

function h4(sigma: Uint8Array, len: number): Uint8Array {
    const b2params = {dkLen: maxSize};

    const h4sigma = blake2s
        .create(b2params)
        .update("IBE-H4")
        .update(sigma)
        .digest();

    return h4sigma.slice(0, len)
}

// Function to convert Noble's FPs to byte arrays compatible with Kilic library.
export function fpToBytes(fp: Fp): Uint8Array {
    // 48 bytes = 96 hex bytes
    const hex = BigInt(fp.value).toString(16).padStart(96, "0")
    const buf = Buffer.alloc(hex.length / 2)
    buf.write(hex, "hex")
    return buf
}

export function fp2ToBytes(fp2: Fp2): Uint8Array {
    return Buffer.concat(fp2.c.map(fpToBytes))
}

// fp6 isn't exported by noble... let's take off the rails
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function fp6ToBytes(fp6: any): Uint8Array {
    return Buffer.concat(fp6.c.map(fp2ToBytes))
}

export function fp12ToBytes(fp12: Fp12): Uint8Array {
    return Buffer.concat(fp12.c.map(fp6ToBytes))
}
