import React from "preact/compat"
import {h} from "preact"
import {Tab, TabView} from "./components/TabView"
import {TextEncrypt} from "./views/TextEncrypt"
import {VulnerabilityReportEncrypt} from "./views/VulnerabilityReportEncrypt"
import {MultiDecrypt} from "./views/MultiDecrypt"

const App = () =>
    <TabView>
        <Tab title={"Text"}>
            <TextEncrypt/>
        </Tab>
        <Tab title={"Vulnerability report"}>
            <VulnerabilityReportEncrypt/>
        </Tab>
        <Tab title={"Decrypt"}>
            <MultiDecrypt/>
        </Tab>
    </TabView>

export {App}
