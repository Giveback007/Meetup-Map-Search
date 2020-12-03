import React from 'react';
import L, { Map as LeafletMap } from 'leaflet';
import * as esriLeaflet from 'esri-leaflet';
import { BasemapLayer } from 'esri-leaflet';
import { linker, State } from '../../store';
import './Map.sass';
// import { linker, State } from ;
// import * as esriLeafletGeocoder from 'https://cdn.skypack.dev/esri-leaflet-geocoder@2.3.3';



type S = { };
type P = { } & ReturnType<typeof link>;

class MapView extends React.Component<P, S> {
    mapRef = React.createRef<HTMLDivElement>();
    map: LeafletMap | null = null;
    componentDidMount() {

        if (this.mapRef.current) {
            this.map = L.map(this.mapRef.current).setView([39.8, -98.57], 4);
            // esriLeaflet.basemapLayer("Topographic").addTo(map);
            // debugger
            // this.map = new LeafletMap('map', {
            //     // preferCanvas: true
            // });

            const layer = new BasemapLayer("Topographic").addTo(this.map);
            layer.beforeAdd
            // this.map.addLayer(layer);
        }

        // .setView([39.8, -98.57], 4);

    }

    render = () => <div ref={this.mapRef} id="map" />;
}

const link = (s: State) => ({ open: s.showLogin });
export default linker(link, MapView);
