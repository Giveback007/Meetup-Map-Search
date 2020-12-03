import { Reducer } from "redux";
import { ControlsActions, CONTROLS_TOGGLE } from "../actions/controls.actions";
import { nonValue } from '@giveback007/util-lib';
import { EventsDate } from "../../types/events-date.type";

const mockDisplayDates: EventsDate[] = [
    { dateId: "2019-01-23", displayDate: "Today", events: ["1", "2"] },
    { dateId: "2019-01-24", displayDate: "Tomorow", events: ["1", "2", "3", "4", "5"] },
    { dateId: "2019-01-25", displayDate: "Jan-25/Fri", events: ["1", "2", "3"] },
];

export interface ControlsState {
    collapsed: boolean;
    displayDates: EventsDate[];
}

const initState: ControlsState = {
    collapsed: false,
    displayDates: mockDisplayDates,
}

export const controlsReducer: Reducer<ControlsState> =
    (state = initState, action: ControlsActions) => {
        
        switch (action.type) {
            case CONTROLS_TOGGLE:
                const collapsed = nonValue(action.payload) ? !state.collapsed : action.payload;

                return { ...state, collapsed };
            default: return state;
        }

}