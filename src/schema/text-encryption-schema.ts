import * as yup from "yup"

export const textEncryptionSchema = yup.object({
    plaintext: yup.string().nullable(true).optional(),
    ciphertext: yup.string().nullable(true).optional(),
    decryptionTime: yup.number()
        .positive()
        .required()
}).required()
