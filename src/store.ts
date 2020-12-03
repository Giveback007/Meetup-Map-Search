import { StateManager, stateManagerReactLinker } from "@giveback007/browser-utils";
import type { Event } from './types/event';

export type State = {
    token: string | null;
    showLogin: boolean;
    events: Event[];
    locEvents: Event[]; // location based events
    onlEvents: Event[]; // online based events
    latLon: [number, number] | null;
}

const exp1 = '2hdi2rl38imnr4pjip0iuo1t4p';
// const exp2 = 'cec00a29d809446f058471f91cb9b75e';
const initState: State = {
    token: exp1,
    showLogin: false,
    events: [],
    latLon: null,
    locEvents: [],
    onlEvents: []
}

class EventStateManager extends StateManager<State> {
    constructor() {
        super(initState, {
            id: 'meetup-map', useKeys: ['token']
        });
    }

    updateEvents(events: Event[]) {
        const o = { locEvents: [] as Event[], onlEvents: [] as Event[], };
        events.forEach(x =>
            o[x.is_online_event ? 'onlEvents' :'locEvents'].push(x));

        this.setState({ ...o, events });
    }
}


export const store = new EventStateManager();
export const linker = stateManagerReactLinker(store);

(window as any).store = store
