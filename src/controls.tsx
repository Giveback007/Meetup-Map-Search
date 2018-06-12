import React = require("react");
import { State } from "./store";
import { Dispatch } from "redux";
import { AppActions, APP_INIT, AppInit } from "./actions";
import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { connect } from "react-redux";

const stateToProps = (state: State) => (state);
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
    ({
        appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
    });

class Controls extends React.Component<
    ReturnType<typeof stateToProps> & 
    ReturnType<typeof dispatchToProps>
> {
    constructor(props) { super(props); }

    init = () => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            this.props.appInit({ lat: latitude, lon: longitude, radius: 25 })
            getMeetupEventData({ key, latitude, longitude, radius: 25 }).then(x => console.log(x));
        });
    }

    render({ lat, lon, radius } = this.props) {
        return (
        <div>
            <button onClick={ this.init }>Start</button>
            <h1>lat: { lat }</h1>
            <h1>lon: { lon }</h1>
            <h1>radius: { radius }</h1>
        </div>)
    }
}

export const ControlsComponent = connect(stateToProps, dispatchToProps)(Controls);
