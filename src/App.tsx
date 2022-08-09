import {Fragment, h} from "preact"
import {useState} from "preact/compat"
import {TextEncrypt} from "./components/TextEncrypt"
import {FileEncrypt} from "./components/FileEncrypt"

const App = () => <Tabs>
    <Tab title={"Text"}>
        <TextEncrypt/>
    </Tab>
    <Tab title={"File"}>
        <FileEncrypt />
    </Tab>
</Tabs>


type TabsProps = {
    children: h.JSX.Element[]
}

const Tabs = (props: TabsProps) => {
    const [selected, setSelected] = useState<string>(props.children[0]?.props.title)

    return (
        <div class="row">
            <div class={"row justify-content-end"}>
                {props.children.map(it =>
                    <TabHeader
                        text={it.props.title}
                        selected={selected === it.props.title}
                        onClick={() => setSelected(it.props.title)}
                    />
                )}
            </div>
            <div class={"row light-bg"}>
                {props.children.map(it => selected === it.props.title ? it : null)}
            </div>
        </div>
    )
}

type TabHeaderProps = {
    selected: boolean
    text: string
    onClick: () => void
}
const TabHeader = (props: TabHeaderProps) => {
    let css = "col col-sm-2 tab-header"

    if (props.selected) {
        css += " tab-header-selected"
    }

    return (
        <div
            class={css}
            onClick={props.onClick}
        >
            {props.text}
        </div>
    )
}


type TabProps = {
    title: string
    children: h.JSX.Element | h.JSX.Element[]
}

const Tab = (props: TabProps) => <Fragment>{props.children}</Fragment>

export {App}
