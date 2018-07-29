import * as fetchJsonp from 'fetch-jsonp';

export const jsonp = async (url) => (await fetchJsonp(url)).json();

interface getMeetupEventDataArgs {
    key?: string;
    token?: string;
    lat: number;
    lon: number;
    radius: number;
}

export function getMeetupEventData({ key, token, lat, lon, radius }: getMeetupEventDataArgs) {
    if (!key && !token) throw console.error('No key or token, at least one is required');

    // TODO: check wait list & high res
    const omit = '&omit=description,visibility,created,id,status,updated,waitlist_count,'
    + 'yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,'
    + 'venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,'
    + 'group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,'
    + 'group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,'
    + 'group.photo.type,group.photo.base_url';
    
    const extras = `&sign=true&photo-host=public&fields=group_photo,group_category`;
    
    const auth = `&${key ? 'key' : 'access_token'}=${key || token}`;
    const location = `&lat=${lat}&lon=${lon}&radius=${radius}`;

    const url = `https://api.meetup.com/find/events?${location}${extras}${omit}${auth}`;

    return jsonp(url);
}



export interface IMeetupApi {
    key?: string;
    token?: string;
}

export class MeetupApi {
    /** Appended at the end of every url token/key */
    private readonly auth: string;

    constructor({ key, token }: IMeetupApi) {
        if (!key && !token) 
        throw console.error('No key or token, at least one is required');
    }
}
