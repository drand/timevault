import * as React from "preact/compat"
import {h, render} from "preact"
import {App} from "./App"

const root = document.getElementById("root") || (() => {
    throw Error("No element found with id root to bind to!!")
})()

render(<App/>, root)
