import React = require("react");
import ReactDOM = require("react-dom");

import { Provider } from "react-redux";
// import { } from "./defn";
// import { } from "./lib";

import "./index.scss";
import "../node_modules/leaflet/dist/leaflet";
import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { ControlsComponent } from "./controls.component";
import { store } from "./store/store";

ReactDOM.render(
    <Provider store={store}>
        <ControlsComponent />
    </Provider>,
    document.getElementById('root')
);

store.subscribe(() => { console.log('state:', store.getState()) });


