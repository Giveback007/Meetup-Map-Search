import React = require("react");
import { connect } from "react-redux";
import { State } from "./store/store";
import { Dispatch } from "redux";
import { AppActions } from "./actions";

import { 
    map as leafMap,
    Map as LeafMap,
    control as mapControl,
    tileLayer,
    TileLayer
} from 'leaflet';

const stateToProps = (state: State) => ({});
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
({
    // appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

class AppMap extends React.Component<
    ReturnType<typeof stateToProps> & 
    ReturnType<typeof dispatchToProps>,
    { map: LeafMap }
> {
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