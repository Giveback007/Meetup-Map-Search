import { ControlsComponent } from './controls.component';
import { MapComponent } from "./map.component";
import { hot } from "react-hot-loader";
import React = require("react");


class AppComponent extends React.Component<{}>{
    render() {
        return (
            <div>
                <ControlsComponent />
                <MapComponent />
            </div>
        )
    }
}

export default hot(module)(AppComponent);
