import React = require("react");
import ReactDOM = require("react-dom");
import { Provider } from "react-redux";
import { createStore } from "redux";

import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { ControlsComponent } from "./controls.component";
import { rootReducer } from "./store/root.reducer";
import { AppComponent } from "./app.component";

import "./index.scss";

export const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <AppComponent />
    </Provider>,
    document.getElementById('root')
);
