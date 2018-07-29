import React = require("react");
import ReactDOM = require("react-dom");
import { Provider } from "react-redux";
import { AppComponent } from "./app.component";
import { store } from "./store/store";

import "./index.scss";

ReactDOM.render(
    <Provider store={store}>
        <AppComponent />
    </Provider>,
    document.getElementById('root')
);
