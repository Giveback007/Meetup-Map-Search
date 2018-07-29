import React = require("react");
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { 
    map as leafMap,
    Map as LeafMap,
    control as mapControl,
    tileLayer,
    TileLayer
} from 'leaflet';
import { State } from "./store/root.reducer";
import { AppActions } from "./store/actions";

const stateToProps = (state: State) => ({});
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
({
    // appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

type P = ReturnType<typeof stateToProps> & ReturnType<typeof dispatchToProps>;
type S = { map: LeafMap };

const initState: S = { map: null };

class AppMap extends React.Component<P, S> {
    state = initState
    constructor(props) { super(props); }

    componentDidMount() {
        const map = leafMap('map', {
            zoomControl: false
        }).setView([38.366473, -96.262056], 5)

        mapControl.zoom({ position: 'bottomright' }).addTo(map)

        const tiles: TileLayer = new TileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://openstreetmap.org/">'
                + 'OpenStreetMap</a> contributors'
        });

        map.addLayer(tiles);

        this.setState({ map })
    }

    render() {
        return (<div id="map"></div>);
    }
}

export const MapComponent = connect(stateToProps, dispatchToProps)(AppMap);
