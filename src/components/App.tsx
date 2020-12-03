import React from 'react';
import { linker, State, store } from '../store';
import Login from './login/Login';

type S = { };
type P = { } & ReturnType<typeof link>;

class App extends React.Component<P, S> {

    componentDidMount() {
        setTimeout(() => store.setState({ text: 'React Works!' }), 1500);
    }

    render() {
        return <>
            <h1>{this.props.text}</h1>
            <Login/>
        </>
    }
}

const link = (s: State) => ({ text: s.text });
export default linker(link, App);
