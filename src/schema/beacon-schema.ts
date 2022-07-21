import * as yup from "yup"
import {hexSchema} from "./hex-schema"

const beaconSchema = yup.object({
    randomness: hexSchema.required(),
    signature: hexSchema.required(),
    round: yup.number().positive().required()
}).required()

export { beaconSchema }
