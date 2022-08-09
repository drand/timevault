import {Fragment, h} from "preact"
import React, {useCallback, useState} from "preact/compat"
import {Button, TextArea, TimeInput} from "../components/Input"
import {encryptFile} from "../actions/encrypt-file"

const FileEncrypt = () => {
    const [files, setFiles] = useState<FileList>()
    const [ciphertext, setCiphertext] = useState("")
    const [decryptionTime, setDecryptionTime] = useState(Date.now())
    const [error, setError] = useState("")

    const onError = (err: unknown) => {
        console.error(err)

        if (err instanceof Error) {
            setError(err.message)
        } else if (typeof err === "string") {
            setError(err)
        }
    }

    const performEncryption = useCallback(async () => {
        try {
            if (!files) {
                console.log("No files to encrypt")
                return
            }
            setCiphertext(await encryptFile(files, decryptionTime))
        } catch (err) {
            onError(err)
        }
    }, [files, ciphertext, decryptionTime])

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
                <div class="col p-0">
                    <Button
                        text={"Encrypt"}
                        onClick={performEncryption}
                    />
                </div>
            </div>

            <div class="row light-bg p-3">
                <div className="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <FileInput
                            label={"Upload a file or archive to encrypt"}
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

type FileInputProps = {
    label: string
    onChange: (files: FileList) => void
}
const FileInput = (props: FileInputProps) =>
    <label
        className="form-label p-lg-0"
    >
        {props.label}

        <input
            type="file"
            className={"form-control"}
            onChange={event => event.currentTarget.files && props.onChange(event.currentTarget.files)}
        />

    </label>

export {FileEncrypt}