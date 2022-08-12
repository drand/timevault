import {Fragment, h} from "preact"
import React, {useEffect, useState} from "preact/compat"
import {TextArea} from "../components/TextArea"
import {DecryptionContent, decryptMulti} from "../actions/decrypt-multi"
import {localisedDecryptionMessageOrDefault} from "../actions/errors"
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
            .catch(err => {
                console.error(err)
                setError(localisedDecryptionMessageOrDefault(err))
            })
            // this seems insane, because it is.
            // calling `setLoading` back to the same value (ie. false) within a single promise causes NONE of the setState calls to be rendered
            // probably because of some fancy prop checking in preact
            // setting timeout seems to work around
            .finally(() => setTimeout(() => setIsLoading(false), 100))

    }, [ciphertext])

    return (
        <Fragment>
            <div className="row light-bg px-3 py-2 align-items-end">
                <div className="col p-0" id="errors">
                    <p className="p-0">{error}</p>
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
                            error={error}
                        />
                    </div>
                </div>
            </div>

        </Fragment>
    )
}

type DecryptedContentViewProps = {
    isLoading: boolean
    error: string
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

    if (props.error !== "") {
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
