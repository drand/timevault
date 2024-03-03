import React, {useState} from "preact/compat"
import {h} from "preact"
import {Tab, TabView} from "./components/TabView"
import {TextEncrypt} from "./views/TextEncrypt"
import {VulnerabilityReportEncrypt} from "./views/VulnerabilityReportEncrypt"
import {MultiDecrypt} from "./views/MultiDecrypt"
import {Dropdown, DropdownItem} from "./components/Dropdown"

export type Network = "quicknet" | "fastnet" | "testnet-unchained-3s" | "quicknet-t"
const networks: Array<DropdownItem<Network>> = [
    {
        label: "Mainnet (quicknet)",
        value: "quicknet"
    },
    {
        label: "Mainnet (fastnet - deprecated)",
        value: "fastnet"
    },
    {
        label: "Testnet (quicknet-t)",
        value: "quicknet-t"
    },
    {
        label: "Testnet (testnet-unchained-3s - deprecated",
        value: "testnet-unchained-3s"
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
                    <MultiDecrypt network={networkURL}/>
                </Tab>
            </TabView>
        </div>
    )
}

export {App}
