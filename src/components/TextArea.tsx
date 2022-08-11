import React from "preact/compat"
import {h} from "preact"

type TextAreaProps = {
    label: string
    value: string
    onChange?: (value: string) => void
    rows?: number
    cols?: number
}

const defaultProps = {
    rows: 25,
    cols: 3
}

export const TextArea = (props: TextAreaProps) =>
    <label
        htmlFor={props.label}
        className="form-label p-lg-0"
    >
        {props.label}
        <textarea
            id={props.label}
            className="form-control"
            cols={props.cols ?? defaultProps.cols}
            rows={props.rows ?? defaultProps.rows}
            value={props.value}
            onChange={event => props.onChange && props.onChange(event.currentTarget.value)}
        ></textarea>
    </label>
