import React = require("react");
import ReactDOM = require("react-dom");
import { Provider } from "react-redux";

import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { ControlsComponent } from "./controls.component";
import { store } from "./store/store";

import "./index.scss";

ReactDOM.render(
    <Provider store={store}>
        <ControlsComponent />
    </Provider>,
    document.getElementById('root')
);
