import {HttpCachingChain, HttpChainClient} from "tlock-js"
import {MAINNET_CHAIN_URL, MAINNET_CHAIN_URL_NON_RFC, TESTNET_CHAIN_URL} from "tlock-js/drand/defaults"

export function quicknet(): HttpChainClient {
    const clientOpts = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: {
            chainHash: "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971",
            publicKey: "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a"
        }
    }
    // passing an empty httpOptions arg to strip the user agent header to stop CORS issues
    return new HttpChainClient(new HttpCachingChain(MAINNET_CHAIN_URL, clientOpts), clientOpts, {})
}

export function fastnet(): HttpChainClient {
    const clientOpts = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: {
            chainHash: "dbd506d6ef76e5f386f41c651dcb808c5bcbd75471cc4eafa3f4df7ad4e4c493",
            publicKey: "a0b862a7527fee3a731bcb59280ab6abd62d5c0b6ea03dc4ddf6612fdfc9d01f01c31542541771903475eb1ec6615f8d0df0b8b6dce385811d6dcf8cbefb8759e5e616a3dfd054c928940766d9a5b9db91e3b697e5d70a975181e007f87fca5e"
        }
    }

    return new HttpChainClient(new HttpCachingChain(MAINNET_CHAIN_URL_NON_RFC, clientOpts), clientOpts, {})
}

export function testnetQuicknet(): HttpChainClient {
    const clientOpts = {
        disableBeaconVerification: false,
        noCache: false,
        chainVerificationParams: {
            chainHash: "cc9c398442737cbd141526600919edd69f1d6f9b4adb67e4d912fbc64341a9a5",
            publicKey: "b15b65b46fb29104f6a4b5d1e11a8da6344463973d423661bb0804846a0ecd1ef93c25057f1c0baab2ac53e56c662b66072f6d84ee791a3382bfb055afab1e6a375538d8ffc451104ac971d2dc9b168e2d3246b0be2015969cbaac298f6502da"
        }
    }

    // passing an empty httpOptions arg to strip the user agent header to stop CORS issues
    return new HttpChainClient(new HttpCachingChain("https://pl-us.testnet.drand.sh/cc9c398442737cbd141526600919edd69f1d6f9b4adb67e4d912fbc64341a9a5", clientOpts), clientOpts, {})
}
export function testnetUnchained(): HttpChainClient {
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
