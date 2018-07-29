import React = require("react");
import { Dispatch } from "redux";
import { getMeetupEventData } from "./api";
import { key } from "./secret";
import { connect } from "react-redux";
import { Menu, Icon, Button } from 'antd';

import { State } from "./store/root.reducer";
import { AppActions, AppInit, APP_INIT } from "./store/actions";

const stateToProps = (state: State) => state.app;
const dispatchToProps = (dispatch: Dispatch<AppActions>) => 
({
    appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

type P = ReturnType<typeof stateToProps> & ReturnType<typeof dispatchToProps>;
type S = { collapsed: boolean }

const initState: S = { collapsed: false };

class Controls extends React.Component<P, S> {
    state = initState;
    constructor(props) { super(props); }

    componentDidMount() {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude: lat, longitude: lon } }) => {
            this.props.appInit({ lat, lon, radius: 25, key, token: null })
        });
    }

    toggleMenu = () => this.setState({ collapsed: !this.state.collapsed });

    render(
        { collapsed } = this.state,
        { lat, lon, radius } = this.props
    ) {
        return (
        <div id="controls">
            <Menu
                id="controls-menu"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="light"
                
                inlineCollapsed={this.state.collapsed}
            >
                <Menu.Item key="1">
                    <Icon type="pie-chart" />
                    <span>Option 1</span>
                </Menu.Item>
                <Menu.Item key="2">
                    <Icon type="desktop" />
                    <span>Option 2</span>
                </Menu.Item>
                <Menu.Item key="3">
                    <Icon type="inbox" />
                    <span>Option 3</span>
                </Menu.Item>
                <Menu.SubMenu key="sub1" title={<span><Icon type="mail" /><span>Navigation One</span></span>}>
                    <Menu.Item key="5">Option 5</Menu.Item>
                    <Menu.Item key="6">Option 6</Menu.Item>
                    <Menu.Item key="7">Option 7</Menu.Item>
                    <Menu.Item key="8">Option 8</Menu.Item>
                </Menu.SubMenu>
                <Menu.SubMenu key="sub2" title={<span><Icon type="appstore" /><span>Navigation Two</span></span>}>
                    <Menu.Item key="9">Option 9</Menu.Item>
                    <Menu.Item key="10">Option 10</Menu.Item>
                    <Menu.SubMenu key="sub3" title="Submenu">
                        <Menu.Item key="11">Option 11</Menu.Item>
                        <Menu.Item key="12">Option 12</Menu.Item>
                    </Menu.SubMenu>
                </Menu.SubMenu>
                
            </Menu>
            <Button
                id="controls-toggle"
                type="primary"
                onClick={this.toggleMenu}
            >
                <Icon type={
                    this.state.collapsed ?
                    'menu-unfold' :
                    'menu-fold'
                }
                    />
            </Button>
        </div>);
    }
}

export const ControlsComponent = connect(stateToProps, dispatchToProps)(Controls);
