import * as yup from "yup"

const webFormSchema = yup.object({
    plaintext: yup.string().nullable(true).optional(),
    ciphertext: yup.string().nullable(true).optional(),
    decryptionTime: yup.number()
        .positive()
        .moreThan(Date.now(), "Decryption time must be in the future!")
        .required()
}).required()

export { webFormSchema }
