import React = require("react");
import { State } from "../store/root.reducer";
import { Dispatch } from "redux";
import { Icon, Input } from 'antd';
import { connect } from "react-redux";
import { DateSelector } from "./date-selector.component";
import { ControlsToggle, ControlsActions } from "../store/actions/controls.actions";

const stateToProps = (state: State) => state.controls;
const dispatchToProps = (dispatch: Dispatch<ControlsActions>) => 
({
    toggleMenu: () => dispatch({ ...(new ControlsToggle) })
    // appInit: (payload: AppInit['payload']) => dispatch({ type: APP_INIT, payload })
});

type P = ReturnType<typeof stateToProps> & ReturnType<typeof dispatchToProps>;
type S = { }

const initState: S = { };

class MenuComponent extends React.Component<P, S> {
    state = initState;
    constructor(props) { super(props); }

    render = ({ collapsed, toggleMenu, displayDates } = this.props) => (
        <div>
            <button
                id="controls-toggle-large"
                onClick={toggleMenu}
            >
                <Icon type={collapsed ? 'right' : 'left'} />
            </button>

            <div
                id="controls-menu"
                className={ `animate${collapsed ? ' closed' : ''}` }
            >
                <button
                    id="controls-toggle-small"
                    onClick={toggleMenu}
                >
                    <Icon type={collapsed ? 'up' : 'down'} />
                </button>

                <div 
                    id="controls-menu-search"
                    className={collapsed ? 'hidden' : ''}
                >
                    <Input />
                    <button><Icon type="search" /></button>
                </div>

                <div className="ghost"></div>

                <div id="controls-date-select">
                    {displayDates.map((date) => <DateSelector data={date} key={date.dateId} />)}
                </div>
            </div>

        </div>
    );
}

export const Menu = connect(stateToProps, dispatchToProps)(MenuComponent);