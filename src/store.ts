import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils";

export type State = {
    text: string;
    token?: string;
    showLogin: boolean;
}

const exp1 = '2hdi2rl38imnr4pjip0iuo1t4p';
// const exp2 = 'cec00a29d809446f058471f91cb9b75e';
export const store = new StateManager<State>({
    text: 'Some Text',
    token: exp1,
    showLogin: false,
}, { id: 'meetup-map-search', useKeys: ['token'] });

export const linker = stateManagerReactLinker(store);
