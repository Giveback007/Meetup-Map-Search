// import { jsonp } from '@giveback007/util-lib';
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

// const searchUrl = `https://api.meetup.com/find/events?` +
//       `&sign=true&photo-host=public&` +
//       `lat=${28.462370}&lon=${-81.107715}` +
//       `&radius=${35}&fields=group_photo,group_category` +
// //       `&omit=${this.api.omit}`+
//       `&access_token=${store.getState().token}`

// jsonp(searchUrl).then(x => console.log(x));
ReactDOM.render(<App />, document.getElementById('root'));

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
import.meta.hot?.accept();
