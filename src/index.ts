import * as yup from "yup"

const plaintextElement = document.getElementById("plaintext") as HTMLTextAreaElement
const ciphertextElement = document.getElementById("ciphertext") as HTMLTextAreaElement
const timeElement = document.getElementById("time") as HTMLInputElement
const encryptButton = document.getElementById("encrypt-button") as HTMLButtonElement
const errorMessage = document.getElementById("error") as HTMLParagraphElement

encryptButton.addEventListener("click", async _ => {
    try {
        const dataToEncrypt = await encryptionForm.validate({
            plaintext: plaintextElement.value,
            time: timeElement.value
        })
        ciphertextElement.value = await tle(dataToEncrypt.plaintext, dataToEncrypt.time)
    } catch (e: unknown) {
        console.error(e)
        errorMessage.innerText = (e as Error).message
    }
})

const encryptionForm = yup.object().shape({
    plaintext: yup.string().required(),
    time: yup.date().required()
}).required()

function tle(data: string, decryptionTime: number): Promise<string> {
    return Promise.resolve(Buffer.from(data + decryptionTime).toString("base64"))
}