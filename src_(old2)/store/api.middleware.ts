import { getMeetupCategories } from './../api';
import { AnyAction } from "../../node_modules/redux";
import { Effects } from "./root.reducer";
import { getMeetupEventData } from '../api';
import { AppInit, APP_INIT } from './actions/app.actions';

export const apiMiddleware: Effects = (store) => (next) => (action: AnyAction) => {
    switch (action.type) {
        case APP_INIT:
            const { key, token } = (action as AppInit).payload;
            const auth = `&${key ? 'key' : 'access_token'}=${key || token}`;

            action.payload.auth = auth;

            getMeetupEventData(action.payload).then((x) => console.log('getMeetupEventData', x));
            getMeetupCategories(auth).then((x) => console.log('getMeetupCategories', x));
    }

    next(action);
}
