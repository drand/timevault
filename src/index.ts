import {CompletedWebForm, encryptedOrDecryptedFormData} from "./encryption"

const plaintextElement = document.getElementById("plaintext") as HTMLTextAreaElement
const ciphertextElement = document.getElementById("ciphertext") as HTMLTextAreaElement
const timeElement = document.getElementById("time") as HTMLInputElement
const encryptButton = document.getElementById("encrypt-button") as HTMLButtonElement
const errorMessage = document.getElementById("error") as HTMLParagraphElement

document.addEventListener("DOMContentLoaded", () => {
    renderDecryptionTime(new Date(Date.now()))
})

encryptButton.addEventListener("click", async () => {
    try {
        clearErrors()
        render(await encryptedOrDecryptedFormData(formAsObject()))
    } catch (e: unknown) {
        renderError(e as Error)
    }
})

function clearErrors() {
    errorMessage.innerText = ""
}

function render(output: CompletedWebForm) {
    if (output.plaintext) {
        plaintextElement.value = output.plaintext
    }
    if (output.ciphertext) {
        ciphertextElement.value = output.ciphertext
    }
    renderDecryptionTime(new Date(output.decryptionTime))
}

function formAsObject() {
    return {
        plaintext: plaintextElement.value,
        ciphertext: ciphertextElement.value,
        decryptionTime: new Date(timeElement.value).getTime(),
    }
}

function renderDecryptionTime(date: Date) {
    timeElement.value = formatDate(date)
}

function formatDate(date: Date) {
    return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, "0")
}

function renderError(error: unknown) {
    console.error(error)

    if (error instanceof Error) {
        errorMessage.innerText = error.message
    } else if (typeof error === "string") {
        errorMessage.innerText = error
    }
}
