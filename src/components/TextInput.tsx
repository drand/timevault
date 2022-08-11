import React from "preact/compat"
import {h} from "preact"

type TextInputProps = {
    label: string
    value: string
    onChange?: (text: string) => void
}
export const TextInput = (props: TextInputProps) =>
    <label className="form-label p-lg-0">
        {props.label}

        <input
            type="text"
            className={"form-control"}
            value={props.value}
            onChange={event => props.onChange && props.onChange(event.currentTarget.value)}
        />
    </label>
