import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils";

export type State = {
    text: string;
    token?: string;
    showLogin: boolean;
}

export const store = new StateManager<State>({
    text: 'Some Text',
    token: 'cec00a29d809446f058471f91cb9b75e',
    showLogin: false,
}, { id: 'meetup-map-search', useKeys: ['token'] });

export const linker = stateManagerReactLinker(store);
