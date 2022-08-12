import React from "preact/compat"
import {h} from "preact"

type FileInputProps = {
    label: string
    onChange: (files: FileList) => void
}

export const FileInput = (props: FileInputProps) =>
    <label className="form-label p-0">
        {props.label}

        <input
            type="file"
            className={"form-control"}
            onChange={event => event.currentTarget.files && props.onChange(event.currentTarget.files)}
        />
    </label>
