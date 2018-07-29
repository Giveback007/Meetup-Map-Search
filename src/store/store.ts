import { createStore, applyMiddleware, Middleware } from "redux";
import { rootReducer, State } from "./root.reducer";


const logger: Middleware = (store) => (next) => (action) => {
    console.log(action);
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

