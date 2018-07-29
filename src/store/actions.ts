export const APP_INIT = 'APP_INIT';

export class AppInit {
    readonly type = APP_INIT;
    payload: {
        lat: number,
        lon: number,
        radius: number,
        key?: string,
        token?: string
        auth?: string
    };
};

export type AppActions = AppInit;
