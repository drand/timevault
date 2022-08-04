import * as yup from "yup"

const webFormSchema = yup.object({
    plaintext: yup.string().nullable(true).optional(),
    ciphertext: yup.string().nullable(true).optional(),
    decryptionTime: yup.number()
        .positive()
        .required()
}).required()

export { webFormSchema }
