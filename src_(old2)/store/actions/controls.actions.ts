export const CONTROLS_TOGGLE = 'CONTROLS_TOGGLE';

export class ControlsToggle {
    readonly type = CONTROLS_TOGGLE;
    payload?: boolean;
}

export type ControlsActions = 
    | ControlsToggle;
