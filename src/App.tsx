import React, {useState} from "preact/compat"
import {h} from "preact"
import {Tab, TabView} from "./components/TabView"
import {TextEncrypt} from "./views/TextEncrypt"
import {VulnerabilityReportEncrypt} from "./views/VulnerabilityReportEncrypt"
import {MultiDecrypt} from "./views/MultiDecrypt"
import {Dropdown, DropdownItem} from "./components/Dropdown"

export type Network = "mainnet" | "testnet"
const networks: Array<DropdownItem<Network>> = [
    {
        label: "Mainnet",
        value: "mainnet"
    },
    {
        label: "Testnet",
        value: "testnet"
    },
]
const App = () => {
    // mainnet is the default network
    const [networkURL, setNetworkURL] = useState<Network>(networks[0].value)
    return (
        <div>
            <Dropdown
                label={"Network"}
                items={networks}
                onChange={newNetworkURL => setNetworkURL(newNetworkURL)}
            />
            <TabView>
                <Tab title={"Text"}>
                    <TextEncrypt network={networkURL}/>
                </Tab>
                <Tab title={"Vulnerability report"}>
                    <VulnerabilityReportEncrypt network={networkURL}/>
                </Tab>
                <Tab title={"Decrypt"}>
                    <MultiDecrypt networkURL={networkURL}/>
                </Tab>
            </TabView>
        </div>
    )
}

export {App}
