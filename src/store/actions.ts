export const APP_INIT = 'APP_INIT';

export class AppInit {
    readonly type = APP_INIT;
    payload: {
        lat: number,
        lon: number,
        radius: number
    };
};

export type AppActions = AppInit;
