import {CompletedWebForm, encryptedOrDecryptedFormData} from "./controller"

const plaintextElement = document.getElementById("plaintext") as HTMLTextAreaElement
const ciphertextElement = document.getElementById("ciphertext") as HTMLTextAreaElement
const timeElement = document.getElementById("time") as HTMLInputElement
const encryptButton = document.getElementById("encrypt-button") as HTMLButtonElement
const errorMessage = document.getElementById("error") as HTMLParagraphElement

document.addEventListener("DOMContentLoaded", () => {
    const now = new Date(Date.now())

    // trim off seconds and milliseconds as drand isn't _quite_ accurate enough with a 30s frequency
    now.setSeconds(0)
    now.setMilliseconds(0)

    timeElement.valueAsDate = now
})

encryptButton.addEventListener("click", async () => {
    try {
        render(await encryptedOrDecryptedFormData(formAsObject()))
    } catch (e: unknown) {
        renderError(e as Error)
    }
})

function formAsObject() {
    return {
        plaintext: plaintextElement.value,
        ciphertext: ciphertextElement.value,
        decryptionTime: timeElement.valueAsDate?.getTime(),
    }
}

function render(output: CompletedWebForm) {
    output.plaintext && (plaintextElement.value = output.plaintext)
    output.ciphertext && (ciphertextElement.value = output.ciphertext)
    timeElement.valueAsDate = new Date(output.decryptionTime)
}

function renderError(error: Error) {
    console.error(error)
    errorMessage.innerText = error.message
}
