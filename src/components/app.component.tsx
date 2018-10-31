import { Controls } from './controls.component';
import { Map } from "./map.component";
import { hot } from "react-hot-loader";
import React = require("react");


class App extends React.Component<{}>{
    render() {
        return (
            <div>
                <Controls />
                <Map />
            </div>
        )
    }
}

export default hot(module)(App);
