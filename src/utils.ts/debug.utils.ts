/** Environment variable that are settable via the browser window and persist to local storage */
export interface envVars {
    debug?: boolean;
    trace?: boolean;
}

export const DEBUG_STORAGE_KEY = 'meetup-map-debug';

export function getEnv({ fromStorage } = { fromStorage: false }): envVars {
    if (fromStorage) {
        const lsString = localStorage.getItem(DEBUG_STORAGE_KEY);
        return lsString ? JSON.parse(lsString) : { };
    } else {
        const obj = (global as any).envVars
        return obj || { };
    }
}

export function setEnv(obj: envVars) {
    const newObj = Object.assign(getEnv({ fromStorage: true }), obj);

    (global as any).envVars = newObj;
    localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(newObj));
}
