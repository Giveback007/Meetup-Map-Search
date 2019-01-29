import { Reducer } from "redux";
import { newStateCurrying } from "../root.reducer";
import { AppActions, APP_INIT } from "../actions/app.actions";

export interface AppState {
    lat: number;
    lon: number;
    radius: number;
    auth: string;
}

const initState: AppState = {
    lat: null,
    lon: null,
    radius: null,
    auth: null
}

export const appReducer: Reducer<AppState> = 
    (state = initState, action: AppActions) => {
    // const newState = newStateCurrying(state);

    switch (action.type) {
        case APP_INIT:
            const { lat, lon, radius, auth } = action.payload;
            // TODO: use obj extract for lat, lon, radius, auth props
            return { ...state, lat, lon, radius, auth };
            // return newState(action.payload);
        default: return state;
    }
}