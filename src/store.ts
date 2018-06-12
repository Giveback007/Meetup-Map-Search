import { APP_INIT, AppActions } from './actions';
import { createStore } from 'redux'
import { Reducer } from "redux";

export interface State {
    lat: number;
    lon: number;
    radius: number;
}

const initState: State = {
    lat: null,
    lon: null,
    radius: null,
}

const rootReducer: Reducer<State> = 
    (state = initState, action: AppActions) => {
    switch (action.type) {
        case APP_INIT:
            const x = { ...action };
            return { ...state, ...action.payload };
        default: return state;
    }
}

export const store = createStore(rootReducer);
