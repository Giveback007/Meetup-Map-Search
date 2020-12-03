import { combineReducers, Middleware } from 'redux';
import { appReducer, AppState } from './reducers/app.reducer';
import { jsonp } from '../api';
import { controlsReducer, ControlsState } from './reducers/controls.reducer';
// import { jsonp } from '../api';
// import { ThunkDispatch } from '../../node_modules/redux-thunk';
// import { store } from './store';

export const newStateCurrying = <S extends State[StateKey]>(state: S) => <T>(obj: T) => Object.assign({}, state, obj);

export type StateKey = keyof State;

export type Effects = Middleware<{}, State>

export interface State {
    app: AppState;
    controls: ControlsState;
}

export const rootReducer = combineReducers<State>({
    app: appReducer,
    controls: controlsReducer
});
