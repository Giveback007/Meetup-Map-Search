import { combineReducers } from 'redux';
import { appReducer, AppState } from './app.reducer';
// import { jsonp } from '../api';
// import { ThunkDispatch } from '../../node_modules/redux-thunk';
// import { store } from './store';

export const newStateCurrying = <S extends State[StateKey]>(state: S) => <T>(obj: T) => Object.assign({}, state, obj);

export type StateKey = keyof State;

export interface State {
    app: AppState
}

export const rootReducer = combineReducers<State>({
    app: appReducer
});



// export function getMeetupCategories({ key, token }): ThunkDispatch<State, any, any> {
//     const auth = `&${key ? 'key' : 'access_token'}=${key || token}`;

//     const url = `https://api.meetup.com/2/categories?&sign=true&photo-host=public${auth}`

//     return (dispatch) => jsonp(url).then((payload) =>
//         dispatch({ type: 'API_LOAD_CATEGORIES', payload }))
// }

// store.dispatch(getMeetupCategories({ key: '', token: '' }))

// store.
// const x: ThunkDispatch<State, any, any> = (dispatch) => jsonp('url').then((payload) =>
// dispatch({ type: 'API_LOAD_CATEGORIES', payload }));