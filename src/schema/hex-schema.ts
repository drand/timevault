import * as yup from "yup"

const hexSchema = yup.string()
    .matches(/^[A-Fa-f\d]+$/)
    .lowercase()
    .required()

export { hexSchema}
