import { combineReducers, Middleware } from 'redux';
import { appReducer, AppState } from './app.reducer';
import { jsonp } from '../api';
// import { jsonp } from '../api';
// import { ThunkDispatch } from '../../node_modules/redux-thunk';
// import { store } from './store';

export const newStateCurrying = <S extends State[StateKey]>(state: S) => <T>(obj: T) => Object.assign({}, state, obj);

export type StateKey = keyof State;

export type Effects = Middleware<{}, State>

export interface State {
    app: AppState
}

export const rootReducer = combineReducers<State>({
    app: appReducer
});
