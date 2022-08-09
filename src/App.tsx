import React from "preact/compat"
import {h} from "preact"
import {Tab, TabView} from "./components/TabView"
import {TextEncrypt} from "./views/TextEncrypt"
import {FileEncrypt} from "./views/FileEncrypt"
import {VulnerabilityReport} from "./views/VulnerabilityReport"

const App = () =>
    <TabView>
        <Tab title={"Text"}>
            <TextEncrypt/>
        </Tab>
        <Tab title={"File"}>
            <FileEncrypt/>
        </Tab>
        <Tab title={"Vulnerability report"}>
            <VulnerabilityReport/>
        </Tab>
    </TabView>

export {App}
