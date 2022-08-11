import {Fragment, h} from "preact"
import React, {useEffect, useState} from "preact/compat"
import {encryptFile} from "../actions/encrypt-file"
import {FileInput} from "../components/FileInput"
import {TimeInput} from "../components/TimeInput"
import {TextArea} from "../components/TextArea"
import {errorMessage} from "../actions/errors"

const FileEncrypt = () => {
    const [files, setFiles] = useState<FileList>()
    const [ciphertext, setCiphertext] = useState("")
    const [decryptionTime, setDecryptionTime] = useState(Date.now())
    const [error, setError] = useState("")

    useEffect(() => {
        if (!files) {
            return
        }
        encryptFile(files, decryptionTime)
            .then(ciphertext => setCiphertext(ciphertext))
            .catch(err => {
                console.error(err)
                setError(errorMessage(err))
            })
    }, [files])

    return (
        <Fragment>
            <div class="light-bg row p-3 align-items-end">
                <div class="col p-0">
                    <TimeInput
                        label={"Decryption time"}
                        value={decryptionTime}
                        onChange={setDecryptionTime}
                    />
                </div>
                <div class="col p-0" id="errors">
                    <p className="m-0 p-0" id="error">{error}</p>
                </div>
            </div>

            <div class="row light-bg px-3">
                <div className="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <FileInput
                            label={"Upload an archive to encrypt"}
                            onChange={setFiles}
                        />
                    </div>
                </div>
                <div className="col-12 col-lg-6 p-3">
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

export {FileEncrypt}
