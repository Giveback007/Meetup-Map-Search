import React = require("react");
import ReactDOM = require("react-dom");

import { Provider } from "react-redux";
// import { } from "./defn";
// import { } from "./lib";

import "./styles/index.scss";
import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { ControlsComponent } from "./controls";
import { store } from "./store";

ReactDOM.render(
    <Provider store={store}>
        <ControlsComponent />
    </Provider>,
    document.getElementById('root')
);

store.subscribe(() => { console.log('state:', store.getState()) });


