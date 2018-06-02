import * as React from "react";
import * as ReactDOM from "react-dom";
// import { } from "./defn";
// import { } from "./lib";

import "./styles/index.scss";
import { getMeetupEventData } from "./api";
import { key } from "./secret";

ReactDOM.render(<h1>Hi there!</h1>, document.getElementById('root'));

// class Main extends React.Component {
//     state = {};
//     constructor(props) { super(props); }


// }

// const omit = '&omit=description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url';
// const latLonString = (latLon: [number, number], radius: number) => `&lat=${latLon[0]}&lon=${latLon[1]}&radius=${radius}`;
// const extras = `&sign=true&photo-host=public&fields=group_photo,group_category`;

// axios.get()
function start(latLon: [number, number]) {
    // const coords = latLonString(latLon, 25);
    // const url = `https://api.meetup.com/find/events?${coords}${extras}${omit}${token}`;
    // const headers = new Headers(//{ 
    //     // 'Access-Control-Allow-Origin' : 'http://localhost:9000',
    //     // 'Access-Control-Expose-Headers': 'X-Meetup-server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimt-Reset',
    //     // 'Access-Control-Allow-Credentials': true,
    //     // 'Access-Control-Allow-Methods': 'GET, OPTIONS',
    //     // 'Access-Control-Max-Age': 86400
    // //}
    // );

    // headers.append('Access-Control-Allow-Origin', '*');
    // axios.get(url, {
    //     withCredentials: true,
    //     headers
    // });

    // Access-Control-Expose-Headers: X-Meetup-server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimt-Reset
// Access-Control-Allow-Origin: http://consumerhost.com
// Access-Control-Allow-Credentials: true
// Access-Control-Allow-Methods: GET, OPTIONS
    // const headers = new Headers({
    //     // 'Access-Control-Allow-Origin' : 'http://localhost:9000/',
    //     // "Access-Control-Allow-Headers": "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With",
    //     // 'Access-Control-Expose-Headers': 'X-Meetup-server, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimt-Reset',
    //     // 'Access-Control-Allow-Credentials': 'true',
    //     // 'Access-Control-Allow-Methods': 'GET, OPTIONS'
    // })
    // headers.append('Access-Control-Allow-Origin', '*');
    // console.log(headers);
    // fetch(url, { headers, mode: 'no-cors' }).then((x) => console.log(x));
}

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => 
        getMeetupEventData({ key, lat: latitude, lon: longitude, radius: 25 }));
} else {
    console.error('Geolocation is not available');
}


