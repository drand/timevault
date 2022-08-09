import {Fragment, h} from "preact"
import {useEffect, useMemo, useState} from "preact/compat"
import {TextArea, TimeInput} from "./Input"
import {CompletedWebForm, encryptedOrDecryptedFormData} from "../actions/encrypt-text"
import {createDebouncer} from "../actions/debounce"

const TextEncrypt = () => {
    const [plaintext, setPlaintext] = useState("")
    const [ciphertext, setCiphertext] = useState("")
    const [decryptionTime, setDecryptionTime] = useState(Date.now())
    const [error, setError] = useState("")
    const debounced = useMemo(() => createDebouncer<CompletedWebForm>(), [])

    useEffect(() => {
        if (!plaintext) {
            return
        }

        debounced(() => encryptedOrDecryptedFormData({plaintext, ciphertext, decryptionTime}))
            .then(output => {
                setCiphertext(output.ciphertext ?? "")
                setDecryptionTime(output.decryptionTime)
            })
            .catch(err => onError(err))
    }, [plaintext])

    const onError = (err: unknown) => {
        console.error(err)

        if (err instanceof Error) {
            setError(err.message)
        } else if (typeof err === "string") {
            setError(err)
        }
    }

    return (
        <Fragment>
            <div class="light-bg row p-3 align-items-end">
                <div class="col col-md-4 p-0">
                    <TimeInput
                        label={"Decryption time"}
                        value={decryptionTime}
                        onChange={setDecryptionTime}
                    />
                </div>
                <div class="col col-md-12 p-0" id="errors">
                    <p className="m-0 p-0" id="error">{error}</p>
                </div>
            </div>

            <div class="row light-bg p-3">
                <div class="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <TextArea
                            label={"Plaintext"}
                            value={plaintext}
                            onChange={setPlaintext}
                        />
                    </div>
                </div>
                <div class="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <TextArea
                            label={"Ciphertext"}
                            value={ciphertext}
                            onChange={setCiphertext}
                        />
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export {TextEncrypt}