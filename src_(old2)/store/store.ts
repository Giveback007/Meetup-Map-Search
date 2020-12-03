import { createStore, applyMiddleware, AnyAction } from "redux";
import { rootReducer, Effects } from "./root.reducer";
import { getEnv } from "../utils.ts/debug.utils";
import { apiMiddleware } from "./api.middleware";

const logger: Effects = (store) => (next) => (action: AnyAction) => {
    const { trace, debug } = getEnv();
    if (debug) {
        const time = new Date();
        console[ trace ? 'trace' : 'log' ](time.getUTCSeconds(), time.getUTCMilliseconds(), action);
    }
    next(action);
}

const middleWare = applyMiddleware(logger, apiMiddleware);
export const store = createStore(rootReducer, middleWare);
