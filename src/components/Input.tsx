import {h} from "preact"

type TimeInputProps = {
    label: string
    value: number
    onChange: (time: number) => void
}
const TimeInput = (props: TimeInputProps) =>
    <label htmlFor="time" className="form-label p-lg-0">{props.label}
        <input
            className="form-control"
            value={formatDate(new Date(props.value))}
            type="datetime-local"
            onChange={event => props.onChange(Date.parse(event.currentTarget.value))}
        />
    </label>


function formatDate(date: Date) {
    return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}`
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, "0")
}

type ButtonProps = {
    onClick: () => void
    text: string
}
const Button = (props: ButtonProps) =>
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

type TextAreaProps = {
    label: string
    value: string
    onChange: (value: string) => void
}

const TextArea = (props: TextAreaProps) =>
    <label
        htmlFor={props.label}
        className="form-label p-lg-0"
    >
        {props.label}
        <textarea
            id={props.label}
            className="form-control"
            cols={3}
            rows={25}
            value={props.value}
            onChange={event => props.onChange(event.currentTarget.value)}
        ></textarea>
    </label>

export {TextArea, Button, TimeInput}