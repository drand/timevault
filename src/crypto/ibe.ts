import * as bls from '@noble/bls12-381';
import {PointG1,utils} from '@noble/bls12-381';
import { blake2s } from '@noble/hashes/blake2s';

export async function encrypt(master: PointG1, ID: Uint8Array, msg: Uint8Array) {
	//if len(msg)>>16 > 0 {
		// we're using blake2 as XOF which only outputs 2^16-1 length
	//	return nil, errors.New("plaintext too long for blake2")


	// 1. Compute Gid = e(master,Q_id)
	const Qid = await bls.PointG2.hashToCurve(ID);
	const Gid = bls.pairing(master, Qid);

	// // 2. Derive random sigma
    const sigma = utils.randomBytes(msg.length);

	// // 3. Derive r from sigma and msg
	const r = h3(sigma, msg);
    
    //const U = bls.PointG1.BASE G1().Point().Mul(r, s.G1().Point().Base())

	// // 5. Compute V = sigma XOR H2(rGid)
	const rGid = Gid.multiply(r); // even in Gt, it's additive notation
	// hrGid, err := gtToHash(rGid, len(msg), H2Tag())

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


function xor(a: Uint8Array, b: Uint8Array) {
	if (a.length != b.length) {
		console.log("Error: xor only works on matching size");
		return;
	}

	let ret = new Uint8Array(a.length);

    for (let i = 0; i < a.length; i++) {
		ret[i] = a[i]^b[i];
	}

	return ret;
}

const maxSize = 1 << 10;

function h3(sigma: Uint8Array, msg: Uint8Array) {

    const b2params = { dkLen: 32 };
    const h3ret = blake2s
    .create(b2params)
    .update("IBE-H3")
    .update(sigma)
    .update(msg)
    .digest();

    //return PointG1.BASE.multiply()
	//return s.G1().Scalar().Pick(random.New(h3)), nil
}