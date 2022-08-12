import React from "preact/compat"
import {h} from "preact"
import {Tab, TabView} from "./components/TabView"
import {TextEncrypt} from "./views/TextEncrypt"
import {VulnerabilityReport} from "./views/VulnerabilityReport"
import {MultiDecrypt} from "./views/MultiDecrypt"

const App = () =>
    <TabView>
        <Tab title={"Text"}>
            <TextEncrypt/>
        </Tab>
        <Tab title={"Vulnerability report"}>
            <VulnerabilityReport/>
        </Tab>
        <Tab title={"Decrypt"}>
            <MultiDecrypt/>
        </Tab>
    </TabView>

export {App}
