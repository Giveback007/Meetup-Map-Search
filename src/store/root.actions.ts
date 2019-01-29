import { AppActions } from "./actions/app.actions";
import { ControlsActions } from "./actions/controls.actions";

export type AllActions =
 | AppActions
 | ControlsActions;
