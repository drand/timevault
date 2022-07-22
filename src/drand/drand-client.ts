import * as yup from "yup"
import * as bls from "@noble/bls12-381"
import {beaconSchema} from "../schema/beacon-schema"

export interface DrandClient {
    get(round: number): Promise<Beacon>
}

export type Beacon = yup.InferType<typeof beaconSchema>

// config for the testnet chain info
export const defaultClientOptions: DrandClientOptions = {
    chainUrl: "https://pl-us.testnet.drand.sh",
    chainHash: "7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf",
    publicKey: "8200fc249deb0148eb918d6e213980c5d01acd7fc251900d9260136da3b54836ce125172399ddc69c4e3e11429b62c11"
}
export type DrandClientOptions = {
    chainUrl: string
    chainHash: string
    publicKey: string
}
export type DrandHttpClientOptions = {
    fetchJson(input: string | URL): Promise<unknown>
}

class DrandHttpClient implements DrandClient {
    constructor(
        private options: DrandClientOptions,
        private config: DrandHttpClientOptions
    ) {
    }

    async getLatest(): Promise<Beacon> {
        return this.getByNumberOrName("latest")
    }

    async get(round: number): Promise<Beacon> {
        return this.getByNumberOrName(round)
    }

    private async getByNumberOrName(roundNumberOrName: number | string): Promise<Beacon> {
        const json = await this.config.fetchJson(`${this.options.chainUrl}/${this.options.chainHash}/public/${roundNumberOrName}`)
        const {round, randomness, signature} = await beaconSchema.validate(json)
        const validBeacon = await verifyBeacon(round, signature, this.options.publicKey)
        if (!validBeacon) {
            throw new Error(`Beacon ${round} retrieved was not valid! Reason unknown`)
        }

        return {
            round,
            randomness,
            signature
        }
    }

    static createFetchClient(options: DrandClientOptions = defaultClientOptions): DrandHttpClient {
        const fetchSuccess = async (url: string | URL) => {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`Error reaching drand: ${response.status}`)
            }
            return await response.json()
        }
        return new DrandHttpClient(options, {fetchJson: fetchSuccess})
    }
}

async function verifyBeacon(round: number, signature: string, publicKey: string): Promise<boolean> {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64BE(BigInt(round))
    const message = await bls.utils.sha256(buffer)
    return await bls.verify(signature, message, publicKey)
}

export {DrandHttpClient}
