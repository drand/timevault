import * as yup from "yup"
import * as bls from "@noble/bls12-381"
import {beaconSchema} from "../schema/beacon-schema"

export interface DrandClient {
    get(round: number): Promise<Beacon>
}

export type Beacon = yup.InferType<typeof beaconSchema>

export type DrandHttpClientOptions = {
    fetchJson(input: string | URL): Promise<unknown>
}

class DrandHttpClient implements DrandClient {
    constructor(
        private publicKey: string,
        private options: DrandHttpClientOptions
    ) {
    }

    async get(round: number): Promise<Beacon> {
        const json = await this.options.fetchJson(`https://pl-us.testnet.drand.sh/public/${round}`)
        const {randomness, signature} = await beaconSchema.validate(json)
        const validBeacon = await verifyBeacon(round, signature, this.publicKey)
        if (!validBeacon) {
            throw new Error(`Beacon ${round} retrieved was not valid! Reason unknown`)
        }

        return {
            round,
            randomness,
            signature
        }
    }

    static createFetchClient(publicKey: string): DrandHttpClient {
        const fetchSuccess = async (url: string | URL) => {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error reaching drand: ${response.status}`)
            }
            return await response.json()
        }
        return new DrandHttpClient(publicKey, {fetchJson: fetchSuccess})
    }
}

async function verifyBeacon(round: number, signature: string, publicKey: string): Promise<boolean> {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64BE(BigInt(round))
    const message = await bls.utils.sha256(buffer)
    return bls.verify(signature, message, publicKey)
}

export {DrandHttpClient}
