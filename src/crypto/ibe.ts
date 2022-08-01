import * as bls from '@noble/bls12-381';
import {Fp, Fp2, Fp12, PointG1, utils} from '@noble/bls12-381';
import {sha256} from "@noble/hashes/sha256"
import {blake2s} from '@noble/hashes/blake2s';

export async function encrypt(master: PointG1, ID: Uint8Array, msg: Uint8Array) {
    //if len(msg)>>16 > 0 {
    // we're using blake2 as XOF which only outputs 2^16-1 length
    //	return nil, errors.New("plaintext too long for blake2")


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
    const hrGid = gtToHash(rGid, msg.length)

    // V := xor(sigma, hrGid)

    // // 6. Compute M XOR H(sigma)
    // hsigma, err := h4(sigma, len(msg))

    // W := xor(msg, hsigma)

    // return &Ciphertext{
    // 	U: U,
    // 	V: V,
    // 	W: W,
    // }, nil

}


// func Decrypt(s pairing.Suite, private kyber.Point, c *Ciphertext) ([]byte, error) {
// 	// 1. Compute sigma = V XOR H2(e(rP,private))
// 	gidt := s.Pair(c.U, private)
// 	hgidt, err := gtToHash(gidt, len(c.W), H2Tag())
// 	if err != nil {
// 		return nil, err
// 	}
// 	if len(hgidt) != len(c.V) {
// 		return nil, fmt.Errorf("XorSigma is of invalid length: exp %d vs got %d", len(hgidt), len(c.V))
// 	}
// 	sigma := xor(hgidt, c.V)

// 	// 2. Compute M = W XOR H4(sigma)
// 	hsigma, err := h4(sigma, len(c.W))
// 	if err != nil {
// 		return nil, err
// 	}

// 	msg := xor(hsigma, c.W)

// 	// 3. Check U = rP
// 	r, err := h3(s, sigma, msg)
// 	if err != nil {
// 		return nil, err
// 	}
// 	rP := s.G1().Point().Mul(r, s.G1().Point().Base())
// 	if !rP.Equal(c.U) {
// 		return nil, fmt.Errorf("invalid proof: rP check failed")
// 	}
// 	return msg, nil

// }

function xor(a: Uint8Array, b: Uint8Array) {
    if (a.length != b.length) {
        console.log("Error: incompatible sizes");
        return;
    }

    const ret = new Uint8Array(a.length);

    for (let i = 0; i < a.length; i++) {
        ret[i] = a[i] ^ b[i];
    }

    return ret;
}

const maxSize = 1 << 10;

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


async function gtToHash(gt: bls.Fp12, length: number) {
    const b2params = {dkLen: maxSize};

    const hgtret = blake2s
        .create(b2params)
        //.update(gt.toBytes())
        .digest();

    return hgtret
}

function h4(sigma: Uint8Array, length: number) {
    const b2params = {dkLen: maxSize};

    const h4sigma = blake2s
        .create(b2params)
        .update("IBE-H2")
        .update(sigma)
        .digest();

    return h4sigma.slice(0, length)
}

export function fpToBytes(fp: Fp): Uint8Array {
    const hex = BigInt(fp.value).toString(16)
    const buf = Buffer.alloc(hex.length / 2)
    buf.write(hex, "hex")
    return buf
}

export function fp2ToBytes(fp2: Fp2): Uint8Array {
    return Buffer.concat(fp2.c.map(fpToBytes))
}

// fp6 isn't exported by noble... let's take off the rails
export function fp6ToBytes(fp6: any): Uint8Array {
    return Buffer.concat(fp6.c.map(fp2ToBytes))
}

export function fp12ToBytes(fp12: Fp12): Uint8Array {
    return Buffer.concat(fp12.c.map(fp6ToBytes))
}
