import { Reducer } from "redux";
import { AppActions, APP_INIT } from "../actions";
import { newStateCurrying } from "./store";

export interface AppState {
    lat: number;
    lon: number;
    radius: number;
}

const initState: AppState = {
    lat: null,
    lon: null,
    radius: null,
}

export const appReducer: Reducer<AppState> = 
    (state = initState, action: AppActions) => {
        
    const newState = newStateCurrying(state);

    switch (action.type) {
        case APP_INIT:
            return newState(action.payload);
        default: return state;
    }
}