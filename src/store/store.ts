import { createStore, combineReducers } from 'redux';
import { appReducer } from './app.reducer';

export const newStateCurrying = <S>(state: S) => <T>(obj: T) => Object.assign({}, state, obj);

const rootReducer = combineReducers({
    app: appReducer
});

export type State = ReturnType<typeof rootReducer>;

export const store = createStore(rootReducer);
