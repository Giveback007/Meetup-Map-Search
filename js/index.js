'use strict';
const meetupApiKey = '3b4a595c65e3f41751b2b30452273';
const local = {lat: '41.957819', lon:'-87.994403'}
const category = 34;
const radius = 15.00;
const page = 10;


let loop = 10;
let tempArr = [];

let groupUrl = [];

function ajaxCall(url) {
	$.ajax({
		url: url,
		type: 'get',
		dataType: "jsonp",
		success: function success(result) {
			console.log(result);
			tempArr = result.data.map(x => x.urlname);
			groupUrl = groupUrl.concat(tempArr);
			if (result.meta.next_link) {
				ajaxCall(result.meta.next_link + '&key=' + meetupApiKey);
			} else {
				console.log('fin', groupUrl);
			}
		},
		error: function error(err) {
			console.log(err);
		}
	});
}

ajaxCall(`https://api.meetup.com/find/groups?&sign=true&photo-host=public&upcoming_events=true&lon=${local.lon}&radius=${radius}&category=${category}&lat=${local.lat}&order=distance&page=${page}&key=${meetupApiKey}`);

// for (var i = 0; i < results[0].address_components.length; i++) {
// 	var component = results[0].address_components[i];
//
//   switch(component.types[0]) {
//     case 'locality':
//       storableLocation.city = component.long_name;
//       break;
//     case 'administrative_area_level_1':
//       storableLocation.state = component.short_name;
//       break;
//     case 'country':
//       storableLocation.country = component.long_name;
//       storableLocation.registered_country_iso_code = component.short_name;
//       break;
//   }
// };
