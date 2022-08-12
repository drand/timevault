import React from "preact/compat"
import { h } from "preact"

type ButtonProps = {
    onClick: () => void
    text: string
}

export const Button = (props: ButtonProps) =>
    <button
        id="encrypt-button"
        type="button"
        className="btn btn-primary float-end"
        onClick={event => {
            event.preventDefault();
            props.onClick()
        }}
    >
        {props.text}
    </button>
