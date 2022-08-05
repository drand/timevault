import {defaultClientInfo, DrandClient, DrandNetworkInfo, DrandHttpClient} from "./drand-client"
import {decryptAge, encryptAge} from "../age/age-encrypt-decrypt"
import {encodeArmor, decodeArmor, isProbablyArmored} from "../age/armor"
import {createTimelockDecrypter} from "./timelock-decrypter"
import {createTimelockEncrypter} from "./timelock-encrypter"

export async function timelockEncrypt(
    config: DrandNetworkInfo,
    roundNumber: number,
    payload: string,
    drandHttpClient: DrandClient = DrandHttpClient.createFetchClient(),
): Promise<string> {
    // probably should get `chainInfo` through /info
    const timelockEncrypter = createTimelockEncrypter(defaultClientInfo, drandHttpClient, roundNumber)
    const agePayload = await encryptAge(Buffer.from(payload), timelockEncrypter)
    return encodeArmor(agePayload)
}

export async function timelockDecrypt(
    ciphertext: string,
    drandHttpClient: DrandClient = DrandHttpClient.createFetchClient()
): Promise<string> {
    const timelockDecrypter = createTimelockDecrypter(drandHttpClient)

    let cipher = ciphertext
    if (isProbablyArmored(ciphertext)) {
        cipher = decodeArmor(cipher)
    }

    return await decryptAge(cipher, timelockDecrypter)
}
