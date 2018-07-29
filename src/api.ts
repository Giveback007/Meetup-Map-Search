import { AppInit } from './store/actions';
import * as fetchJsonp from 'fetch-jsonp';

// -- DATA -- //

/** Add to the url to define data to omit from the response  */
// TODO: check wait list & high res
const omit = '&omit=description,visibility,created,id,status,updated,waitlist_count,'
+ 'yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,'
+ 'venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,'
+ 'group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,'
+ 'group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,'
+ 'group.photo.type,group.photo.base_url';

/** Add to the url to to define extra options */
const extras = `&photo-host=public&fields=group_photo,group_category`;

// -- DATA -- //

export const jsonp = async (url) => (await fetchJsonp(url)).json();

export function getMeetupEventData({ auth, lat, lon, radius }: AppInit['payload']) {

    const location = `&lat=${lat}&lon=${lon}&radius=${radius}`;
    const url = `https://api.meetup.com/find/events?&sign=true${location}${extras}${omit}${auth}`;

    return jsonp(url);
}


export const getMeetupCategories = (auth) =>
    jsonp(`https://api.meetup.com/2/categories?&sign=true${auth}`);
