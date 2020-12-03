import { hasKey, jsonp, sec } from '@giveback007/util-lib';
const { env } = import.meta;

import 'normalize.css'
import 'leaflet/dist/leaflet.css'
import './index.sass';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { store } from './store';

if (env.MODE === 'development') {
    // -- Run in DEV only -- //
}

if (env.MODE === 'production') {
    // -- Run in PROD only -- //
}

(() => {
  const tokenFromUrl = /#access_token=\s*(.*?)\s*&/g.exec(window.location.href)
  if (tokenFromUrl) return store.setState({ token: tokenFromUrl[1] });

  if (!store.getState().token) return store.setState({ showLogin: true });

  // if have token check if it works
})();

const getLocation = (): Promise<Position | PositionError> =>
    new Promise((res) => navigator.geolocation.getCurrentPosition(
        pos => res(pos), err => res(err), {
            maximumAge: Infinity, timeout: sec(5)
        }));

type urlParams = { lat: number, lon: number, radius: number, token: string };
const searchUrl = (p: urlParams) => `https://api.meetup.com/find/upcoming_events?` +
    `&sign=true&photo-host=public&` +
    `lat=${p.lat}&lon=${p.lon}` +
    `&radius=${p.radius}&fields=group_photo,group_category` +
    // + `&omit=${this.api.omit}`+
    `&access_token=${p.token}`

// const

export async function getData() {
    const location = await getLocation();
    if (hasKey(location, 'code')) {
        // request to input location
    } else {
        const { longitude: lon, latitude: lat } = location.coords;
        const x = searchUrl({ lat, lon, radius: 35, token: store.getState().token || '' });

        const data = await jsonp(x);
        return data;
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
import.meta.hot?.accept();
