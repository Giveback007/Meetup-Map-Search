import React from 'react';
import L, { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import 'leaflet.markercluster';
import { BasemapLayer } from 'esri-leaflet';
import { linker, State } from '../../store';
import { equal } from '@giveback007/util-lib';
import './Map.sass';
import type { Event } from 'src/types/event';
// import { linker, State } from ;
// import * as esriLeafletGeocoder from 'https://cdn.skypack.dev/esri-leaflet-geocoder@2.3.3';

type S = { };
type P = { } & ReturnType<typeof link>;

class MapView extends React.Component<P, S> {
    mapRef = React.createRef<HTMLDivElement>();
    map: LeafletMap | null = null;

    // https://github.com/Leaflet/Leaflet.markercluster
    markerCluster = new L.MarkerClusterGroup({
        animate: true,
        animateAddingMarkers: true,
        removeOutsideVisibleBounds: false,
        showCoverageOnHover: true,
        maxClusterRadius: 60 // | ((zoom: number) => number)
        // iconCreateFunction
    });

    shouldComponentUpdate(np: P) {
        const p = this.props;

        if (this.map) {
            if (np.latLon && !equal(p.latLon, np.latLon))
                this.map.setView(np.latLon, 10)

            if (
                !equal(np.locEvents, p.locEvents)
                ||
                !equal(np.onlEvents, p.onlEvents)
            ) {
                this.eventsToMap(np.locEvents, np.onlEvents);
            }
        }

        return false
    }

    componentDidMount() {
        if (this.mapRef.current) {
            this.map = new LeafletMap(this.mapRef.current, {
                zoomSnap: 0.4,
                preferCanvas: true,
            }).setView([39.8, -98.57], 4.5);
            new BasemapLayer("Topographic").addTo(this.map);
            this.map.zoomControl.setPosition('bottomright');

            this.map.on('click', (e: LeafletMouseEvent) => {
                console.log(e.latlng);

                // alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
            });

            // centerMarker = L.marker();
            // centerRadius = L.circle();
            // markerCluster = L.markerClusterGroup();
            // this.mainMap.removeLayer(this.centerMarker);
            // this.mainMap.removeLayer(this.centerRadius);
            // this.mainMap.flyTo(loc, 10, {duration: 3});
            // const centerIcon = L.divIcon({
            //     className: 'centerMarker',
            //     iconSize: new L.Point(50, 50),
            //     html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
            // });
            // this.centerMarker = L.marker(loc, {
            //     icon: centerIcon,
            //     title: 'Search Center'
            // });
            // this.mainMap.addLayer(this.centerMarker);
            // this.centerRadius = L.circle(loc, {
            //     radius: 1609.344 * rds,
            //     interactive: false,
            //     fillOpacity: 0.07,
            //     opacity: 0.4
            // });
            // this.mainMap.addLayer(this.centerRadius);

            ////////////////////////////////////
            // Getting the bounds of a cluster
            //
            // When you receive an event from a cluster you can query it for the bounds.
            //
            // markers.on('clusterclick', function (a) {
            // 	var latLngBounds = a.layer.getBounds();
            // });
            ////////////////////////////////////
        }


    }

    eventsToMap(local: Event[], online: Event[]) {
        online
        this.markerCluster.clearLayers();
        local.forEach(ev => {
            if (!ev.venue) console.log(ev);

            let hasExactLoc: boolean;
            const v = ev.venue;
            const g = ev.group;

            let loc: [number, number] = [0, 0];
            if (v && v.lat && v.lon) {
                loc = [v.lat, v.lon];
                hasExactLoc = true;
            } else {
                loc = [g.lat, g.lon];
                hasExactLoc = false; // TODO: have a way to filter these
            }

            const img = g.photo?.thumb_link;

            loc; img; hasExactLoc;
        })
    }

    render = () => <div ref={this.mapRef} id="map" />;
}

const link = (s: State) => {
    // console.log(s);

    return {
        locEvents: s.locEvents,
        onlEvents: s.onlEvents,
        latLon: s.latLon
    }
};
export default linker(link, MapView);
