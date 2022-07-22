import {CompletedWebForm, encryptedOrDecryptedFormData} from "./encryption"

const plaintextElement = document.getElementById("plaintext") as HTMLTextAreaElement
const ciphertextElement = document.getElementById("ciphertext") as HTMLTextAreaElement
const timeElement = document.getElementById("time") as HTMLInputElement
const encryptButton = document.getElementById("encrypt-button") as HTMLButtonElement
const errorMessage = document.getElementById("error") as HTMLParagraphElement

document.addEventListener("DOMContentLoaded", () => {
    renderDecryptionTime(Date.now())
})

encryptButton.addEventListener("click", async () => {
    try {
        clearErrors()
        render(await encryptedOrDecryptedFormData(formAsObject()))
    } catch (e: unknown) {
        renderError(e as Error)
    }
})

function formAsObject() {
    return {
        plaintext: plaintextElement.value,
        ciphertext: ciphertextElement.value,
        decryptionTime: timeElement.valueAsNumber,
    }
}

function render(output: CompletedWebForm) {
    if (output.plaintext) {
        plaintextElement.value = output.plaintext
    }
    if (output.ciphertext) {
        ciphertextElement.value = output.ciphertext
    }
    renderDecryptionTime(output.decryptionTime)
}

function renderError(error: Error) {
    console.error(error)
    errorMessage.innerText = error.message
}

function renderDecryptionTime(time: number) {
    const wrappedTime = new Date(time)
    wrappedTime.setSeconds(0)
    wrappedTime.setMilliseconds(0)
    // neither `value` nor `valueAsDate` work in both chrome _and_ firefox... nice
    timeElement.valueAsNumber = wrappedTime.getTime()
}

function clearErrors() {
    errorMessage.innerText = ""
}
