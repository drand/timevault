import React, {useEffect, useMemo, useState} from "preact/compat"
import {Fragment, h} from "preact"
import {CompletedWebForm, encryptedOrDecryptedFormData} from "../actions/encrypt-text"
import {createDebouncer} from "../actions/debounce"
import {TextArea} from "../components/TextArea"
import {TimeInput} from "../components/TimeInput"
import {errorMessage} from "../actions/errors"

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
            .catch(err => {
                console.error(err)
                setError(errorMessage(err))
            })
    }, [plaintext, decryptionTime])

    return (
        <Fragment>
            <div className="row p-0" id="errors">
                <p className="m-0 p-0" id="error">{error}</p>
            </div>
            <div className={"col-sm-6 p-3"}>
                <div className="row mb-6">
                    <TimeInput
                        label={"Decryption time"}
                        value={decryptionTime}
                        onChange={setDecryptionTime}
                    />
                </div>
            </div>

            <div class="row light-bg p-0">
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
