import React = require("react");
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Menu } from "./menu.component";

import { State } from "../store/root.reducer";
import { AppActions, AppInit, APP_INIT } from "../store/actions";

const stateToProps = (state: State) => state.app;
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
({
    appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

type P = ReturnType<typeof stateToProps> & ReturnType<typeof dispatchToProps>;
type S = { collapsed: boolean }

// const initState: S = { collapsed: false };

class ControlsComponent extends React.Component<P, S> {
    // state = initState;
    constructor(props) { super(props); }

    componentDidMount() {
        return;
        const key = '' // DELETE
        navigator.geolocation.getCurrentPosition(({ coords: { latitude: lat, longitude: lon } }) => {
            this.props.appInit({ lat, lon, radius: 25, key, token: null })
        });
    }

    render(
        { collapsed } = this.state,
        { lat, lon, radius } = this.props
    ) {
        return (
        <div id="controls">
            <Menu />
        </div>);
    }
}

export const Controls = connect(stateToProps, dispatchToProps)(ControlsComponent);
