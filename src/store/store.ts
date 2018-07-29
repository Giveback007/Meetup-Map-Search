import { createStore, applyMiddleware, Middleware, AnyAction } from "redux";
import { rootReducer, State } from "./root.reducer";
import { getEnv } from "../utils.ts/debug.utils";

const logger: Middleware = (store) => (next) => (action: AnyAction) => {
    
    const { trace, debug } = getEnv();

    if (debug) {
        const time = new Date();
        console[ trace ? 'trace' : 'log' ](time.getUTCSeconds(), time.getUTCMilliseconds(), action);
    }

    next(action);
}

export const store = 
createStore(
    rootReducer,
    applyMiddleware(
        logger,
        // ReduxThunk
    )
);
