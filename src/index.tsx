import React = require("react");
import ReactDOM = require("react-dom");
import { Provider } from "react-redux";
import { AppComponent } from "./app.component";
import { store } from "./store/store";
import { getEnv, setEnv } from "./utils.ts/debug.utils";

import "./index.scss";

// -- Debug Stuff -- //
(global as any).getEnv = getEnv;
(global as any).setEnv = setEnv;
(global as any).envVars = getEnv({ fromStorage: true });
// -- Debug Stuff -- //

ReactDOM.render(
    <Provider store={store}>
        <AppComponent />
    </Provider>,
    document.getElementById('root')
);
