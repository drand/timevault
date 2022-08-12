import {Fragment, h} from "preact"
import React, {useEffect, useState} from "preact/compat"
import {defaultClientInfo, timeForRound} from "tlock-js"
import {TextArea} from "../components/TextArea"
import {DecryptionContent, decryptMulti} from "../actions/decrypt-multi"
import {errorMessage} from "../actions/errors"
import {Button} from "../components/Button"
import {TextInput} from "../components/TextInput"
import {downloadFile} from "../actions/file-utils"

export const MultiDecrypt = () => {
    const [ciphertext, setCiphertext] = useState("")
    const [content, setContent] = useState<DecryptionContent>()
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!ciphertext) {
            return
        }
        setIsLoading(true)
        decryptMulti(ciphertext)
            .then(c => setContent(c))
            .then(() => setIsLoading(false))
            .catch(err => {
                console.error(err)

                // this is quite a brittle way to display decryption time
                const message = errorMessage(err)
                const tooEarlyToDecryptErrorMessage = "It's too early to decrypt! Can only be decrypted after round "
                if (message.startsWith(tooEarlyToDecryptErrorMessage)) {
                    const roundNumber = Number.parseInt(message.split(tooEarlyToDecryptErrorMessage)[1])
                    const timeToDecryption = new Date(timeForRound(roundNumber, defaultClientInfo))
                    setError(`This message cannot be decrypted until ${timeToDecryption.toLocaleDateString()} at ${timeToDecryption.toLocaleTimeString()}`)
                } else {
                    setError("There was an error during decryption! Is your ciphertext valid?")
                }

                setIsLoading(false)
            })
    }, [ciphertext])

    return (
        <Fragment>
            <div className="row light-bg px-3 py-2 align-items-end">
                <div className="col p-0" id="errors">
                    <p className="m-0 p-0" id="error">{error}</p>
                </div>
            </div>

            <div className="row light-bg">
                <div className="col-12 col-lg-6 px-3">
                    <div className="row mb-6">
                        <TextArea
                            label={"Ciphertext"}
                            value={ciphertext}
                            onChange={setCiphertext}
                        />
                    </div>
                </div>
                <div className="col-12 col-lg-6 px-3">
                    <div className="row mb-6">
                        <DecryptedContentView
                            content={content}
                            isLoading={isLoading}
                            isError={!!error && error !== ""}
                        />
                    </div>
                </div>
            </div>

        </Fragment>
    )
}

type DecryptedContentViewProps = {
    isLoading: boolean
    isError: boolean
    content?: DecryptionContent
}
const DecryptedContentView = (props: DecryptedContentViewProps) => {
    if (props.isLoading) {
        return (
            <div className={"row justify-content-center"}>
                <div className="spinner-border" role="status"></div>
            </div>
        )
    }

    if (props.isError) {
        return <div className={"row"}></div>
    }

    const content = props.content
    if (!content) {
        return (
            <div className={"row text-center"}>
                <p><br/>This will load once you enter a ciphertext...</p>
            </div>
        )
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

    if (content.type === "vulnerability_report") {
        return <VulnerabilityReport {...content.value} />
    }

    throw Error("Impossibru!")
}

type VulnerabilityReportProps = {
    title: string
    description: string
    cve?: string
    file?: File
}
const VulnerabilityReport = (props: VulnerabilityReportProps) => {
    const file = props.file

    return (
        <div className="col px-3">
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
            <div className="row mb-6 py-3">
                {file != null
                    ? <Button
                        onClick={() => file && downloadFile(file)}
                        text={"Click to download attached file"}
                    />
                    : null
                }
            </div>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {
}
