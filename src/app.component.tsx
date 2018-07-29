import { ControlsComponent } from './controls.component';
import { MapComponent } from "./map.component";
import React = require("react");


export class AppComponent extends React.Component<{}>{
    render() {
        return (
            <div>
                

                <ControlsComponent />

                <MapComponent />
                
                

                
            </div>
        )
    }
}