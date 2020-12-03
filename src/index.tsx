const { env } = import.meta;

import 'normalize.css'
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

function getToken() {
  // const { token } = store.getState();
  const token = false
  if (!token) {
    const tokenFromUrl = /#access_token=\s*(.*?)\s*&/g.exec(window.location.href)

    if (tokenFromUrl) return store.setState({ token: tokenFromUrl[1] });

    return store.setState({ showLogin: true });
  }

  return;
}
getToken()
ReactDOM.render(<App />, document.getElementById('root'));

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
import.meta.hot?.accept();
