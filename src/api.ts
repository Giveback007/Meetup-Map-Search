import * as fetchJsonp from 'fetch-jsonp';

const jsonp = async (url) => (await fetchJsonp(url)).json();

interface getMeetupEventDataArgs {
    key?: string;
    token?: string;
    latitude: number;
    longitude: number;
    radius: number;
}

export async function getMeetupEventData({ key, token, latitude, longitude, radius }: getMeetupEventDataArgs) {
    if (!key && !token) return console.error('no key or token');

    // TODO: check wait list & high res
    const omit = '&omit=description,visibility,created,id,status,updated,waitlist_count,'
    + 'yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,'
    + 'venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,'
    + 'group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,'
    + 'group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,'
    + 'group.photo.type,group.photo.base_url';
    
    const extras = `&sign=true&photo-host=public&fields=group_photo,group_category${omit}`;

    if (!(key || token)) throw 'no key or token';
    
    const auth = `&${key ? 'key' : 'access_token'}=${key || token}`;
    const location = `&lat=${latitude}&lon=${longitude}&radius=${radius}`;

    const url = `https://api.meetup.com/find/events?${location}${extras}${auth}`;

    return jsonp(url);
}
