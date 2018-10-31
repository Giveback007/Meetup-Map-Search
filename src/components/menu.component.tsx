import React = require("react");
import { State } from "../store/root.reducer";
import { Dispatch } from "redux";
import { AppActions } from "../store/actions";
import { Icon, Button } from 'antd';
import { connect } from "react-redux";

const stateToProps = (state: State) => state.app;
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
({
    // appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

type P = ReturnType<typeof stateToProps> & ReturnType<typeof dispatchToProps>;
type S = { collapsed: boolean }

const initState: S = { collapsed: false };

class MenuComponent extends React.Component<P, S> {
    state = initState;
    constructor(props) { super(props); }

    toggleMenu = () => this.setState({ collapsed: !this.state.collapsed });

    render() {
        return (
            <div>
                <div
                    id="controls-menu"
                >
                    <Input />
                </div>
                <Button
                    id="controls-toggle"
                    type="primary"
                    onClick={this.toggleMenu}
                >
                    <Icon 
                        type={
                            this.state.collapsed ?
                            'menu-unfold' :
                            'menu-fold'
                        }
                    />
                </Button>
            </div>
        );
    }
}

export const Menu = connect(stateToProps, dispatchToProps)(MenuComponent);