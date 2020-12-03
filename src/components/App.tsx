import React from 'react';
import { linker, State } from '../store';
import Login from './login/Login';
import Map from './map/Map';

type S = { };
type P = { } & ReturnType<typeof link>;

class App extends React.Component<P, S> {
    render() {
        return <>
            <Map />
            <Login/>
        </>
    }
}

const link = ({}: State) => ({ });
export default linker(link, App);
