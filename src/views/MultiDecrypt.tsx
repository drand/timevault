import {Fragment, h} from "preact"
import React, {useEffect, useState} from "preact/compat"
import {TextArea} from "../components/TextArea"
import {DecryptionContent, decryptMulti} from "../actions/decrypt-multi"
import {errorMessage} from "../actions/errors"
import {Button} from "../components/Button"
import {TextInput} from "../components/TextInput"

export const MultiDecrypt = () => {
    const [ciphertext, setCiphertext] = useState("")
    const [content, setContent] = useState<DecryptionContent>()
    const [error, setError] = useState("")
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        if (!ciphertext) {
            return
        }
        decryptMulti(ciphertext)
            .then(c => setContent(c))
            .catch(err => {
                console.error(err)
                setError(errorMessage(err))
            })
    }, [ciphertext])


    return (
        <Fragment>
            <div className="light-bg row p-3 align-items-end">
                <div className="col p-0" id="errors">
                    <p className="m-0 p-0" id="error">{error}</p>
                </div>
            </div>

            <div className="row light-bg p-3">
                <div className="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <TextArea
                            label={"Ciphertext"}
                            value={ciphertext}
                            onChange={setCiphertext}
                        />
                    </div>
                </div>
                <div className="col-12 col-lg-6 p-3">
                    <div className="row mb-6">
                        <DecryptedContentView content={content}/>
                    </div>
                </div>
            </div>

        </Fragment>
    )
}

type DecryptedContentViewProps = {
    content?: DecryptionContent
}
const DecryptedContentView = (props: DecryptedContentViewProps) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = () => {
    }
    const content = props.content
    if (!content) {
        return <p>This will load once you enter a ciphertext...</p>
    }

    if (content.type === "text") {
        return (
            <TextArea
                label={"Plaintext"}
                value={content.value}
                onChange={noop}
            />
        )
    }

    if (content.type === "file") {
        return (
            <Button
                onClick={() => downloadFile(content.value)}
                text={"Click to download decrypted file"}
            />
        )
    }

    if (content.type === "vulnerability_report") {
        return <VulnerabilityReport {...content.value} />
    }

    throw Error("Impossibru!")
}

type VulnerabilityReportProps = {
    title: string
    description: string
    cve?: string | null
    file?: File | null
}
const VulnerabilityReport = (props: VulnerabilityReportProps) =>
    <div className="col p-3">
        <div className="row mb-6">
            <TextInput
                label={"Title"}
                value={props.title}
            />
        </div>
        <div className="row mb-6">
            <TextArea
                label={"Description"}
                value={props.description}
                rows={15}
            />
        </div>
        <div className="row mb-6">
            <TextInput
                label={"CVE"}
                value={props.cve ?? ""}
            />
        </div>
        <div className="row mb-6">
            <p>PUT SOME FILE DOWNLOADER HERE</p>
        </div>
    </div>

function downloadFile(file: File) {
    const anchor = document.createElement("a")
    anchor.href = URL.createObjectURL(file)
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
}
