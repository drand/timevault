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
    rows: 26,
    cols: 3
}

export const TextArea = (props: TextAreaProps) =>
    <label className="form-label p-0">
        {props.label}
        <textarea
            className="form-control"
            cols={props.cols ?? defaultProps.cols}
            rows={props.rows ?? defaultProps.rows}
            value={props.value}
            onChange={event => props.onChange && props.onChange(event.currentTarget.value)}
        ></textarea>
    </label>
