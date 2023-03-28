import {HttpCachingChain, HttpChainClient} from "tlock-js"
import {MAINNET_CHAIN_URL, TESTNET_CHAIN_URL} from "tlock-js/drand/defaults"

export function mainnet(): HttpChainClient {
    const clientOpts = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: {
            chainHash: "dbd506d6ef76e5f386f41c651dcb808c5bcbd75471cc4eafa3f4df7ad4e4c493",
            publicKey: "a0b862a7527fee3a731bcb59280ab6abd62d5c0b6ea03dc4ddf6612fdfc9d01f01c31542541771903475eb1ec6615f8d0df0b8b6dce385811d6dcf8cbefb8759e5e616a3dfd054c928940766d9a5b9db91e3b697e5d70a975181e007f87fca5e"
        }
    }
    // passing an empty httpOptions arg to strip the user agent header to stop CORS issues
    return new HttpChainClient(new HttpCachingChain(MAINNET_CHAIN_URL, clientOpts), clientOpts, {})
}

export function testnet(): HttpChainClient {
    const clientOpts = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: {
            chainHash: "7672797f548f3f4748ac4bf3352fc6c6b6468c9ad40ad456a397545c6e2df5bf",
            publicKey: "8200fc249deb0148eb918d6e213980c5d01acd7fc251900d9260136da3b54836ce125172399ddc69c4e3e11429b62c11"
        }
    }

    // passing an empty httpOptions arg to strip the user agent header to stop CORS issues
    return new HttpChainClient(new HttpCachingChain(TESTNET_CHAIN_URL, clientOpts), clientOpts, {})
}
