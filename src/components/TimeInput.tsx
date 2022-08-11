import {h} from "preact"

type TimeInputProps = {
    label: string
    value: number
    onChange: (time: number) => void
}
export const TimeInput = (props: TimeInputProps) =>
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