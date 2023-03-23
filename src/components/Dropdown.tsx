import React, {useMemo, useState} from "preact/compat"
import {h} from "preact"

export type DropdownItem<T> = {
    label: string
    value: T
}

type DropdownProps<T> = {
    label: string
    items: Array<DropdownItem<T>>
    onChange: (value: T) => unknown
}

export function Dropdown<T>(props: DropdownProps<T>) {
    const [active, setActive] = useState(0)
    const id = useMemo(() => Math.random() * 100, [])
    const [showDropdown, setShowDropdown] = useState(false)
    return (
        <div>
            <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle"
                        type="button"
                        id={`dropdownMenuButton${id}`}
                        onClick={() => setShowDropdown(!showDropdown)}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                >
                    {props.label}: {props.items[active].label}
                </button>
                <ul className="dropdown-menu" style={{display: showDropdown ? "block" : "none"}}
                    aria-labelledby={`dropdownMenuButton${id}`}>
                    {props.items.map((item, index) =>
                        <li>
                            <a
                                className={index === active ? "dropdown-item active" : "dropdown-item"}
                                onClick={() => {
                                    setActive(index)
                                    setShowDropdown(false)
                                    props.onChange(item.value)
                                }}
                            >
                                {item.label}
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}