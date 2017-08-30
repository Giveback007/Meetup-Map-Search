'use strict';

//@prepros-append babel/getEventData.js
//@prepros-append babel/leaflet.js

// -- helpers -- //
function ajaxCall(url) {
	return new Promise(function (resolve, reject) {
		$.ajax({
			url: url,
			type: 'get',
			dataType: "jsonp",
			success: function success(x) {
				// console.log(x); // temp
				resolve(x);
			},
			error: function error(err) {
				reject(err);
			}
		});
	});
}

function limiter(meta) {
	var limit = Number(meta['X-RateLimit-Remaining']),
	    reset = Number(meta['X-RateLimit-Reset']);
	console.log('limit left ' + limit, ', reset ' + reset);
	return new Promise(function (resolve, reject) {
		if (limit <= 1) {
			console.log('limit reached, ' + reset + ' seconds until reset'); // temp -- change to load counter
			setTimeout(resolve, reset * 1000 + 500);
		} else {
			resolve();
		}
	});
}
// -- helpers -- //


// -- findEvents -- //
function findEvents(url) {
	var eventArr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	var events = eventArr;
	return new Promise(function (resolve, reject) {

		function getTime(time) {
			var date = new Date(time);
			return {
				unix: time,
				year: date.getUTCFullYear(),
				month: date.getUTCMonth(),
				day: date.getUTCDate(),
				hour: date.getUTCHours(),
				min: date.getUTCMinutes(),
				weekDay: date.getUTCDay()
			};
		}

		// -- nextPage -- //
		function nextPage(result) {

			var tempArr = result.data.map(function (x) {
				var obj = x;
				obj.loc = obj.venue ? [obj.venue.lat, obj.venue.lon] : null;
				obj.time = getTime(obj.time + obj.utc_offset);
				obj.duration = obj.duration / 60000 || null;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});
			events = events.concat(tempArr);

			var lastEvent = tempArr[tempArr.length - 1]; // temp
			console.log('last date', lastEvent.time); // temp

			var lastDate = tempArr[tempArr.length - 1].time.unix;

			if (result.meta.next_link && lastDate < params.dateLimit) {
				limiter(result.meta).then(function () {
					ajaxCall(result.meta.next_link + ('&key=' + params.meetupKey)).then(function (x) {
						return nextPage(x);
					});
				});
			} else {
				console.log(events); // temp
				params.mem.next_link = result.meta.next_link;
				resolve(events);
			}
		}
		// -- nextPage -- //

		ajaxCall(url).then(function (x) {
			return nextPage(x);
		});
	});
}

// -- event data -- //
var params = {
	meetupKey: '457b71183481b13752d69755d97632',
	local: ['41.957819', '-87.994403'],
	radius: 30, // max 100.00
	dateLimit: Date.now() + 1 * 24 * 60 * 60000,
	api: {
		omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
		eventUrl: function eventUrl() {
			return 'https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=' + params.local[0] + '&lon=' + params.local[1] + '&radius=' + params.radius + '&fields=group_photo,group_category&omit=' + params.api.omit + '&key=' + params.meetupKey;
		}
	},
	mem: {}
};

params.mem.events = findEvents(params.api.eventUrl());
// -- event data -- //

params.mem.events.then(function (x) {
	return setMap(params.local, x);
});

var mainMap = L.map('map').setView(params.local, 10); // TODO: set zoom to full view of radius

function initMap() {
	var openstreetmaps = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors' });
	mainMap.addLayer(openstreetmaps);
}
initMap();

function setMap() {
	var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : params.local;
	var events = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	// let centerIcon = L.divIcon({className: 'centerMarker'});
	// let centerMarker = L.marker(center, {icon: centerIcon}).addTo(mainMap);
	// centerMarker.bindPopup("<b>You Are Here</b>");

	// -- Create Markers From Events Data -- //
	var markerCluster = L.markerClusterGroup();
	events.map(function (x) {
		// if (!x.loc) {coord = [x.group.lat, x.group.lon]}
		if (!x.loc) {
			return;
		}
		var marker = new L.marker(x.loc);
		var popup = new L.Popup({ closeButton: false, offset: new L.Point(0.5, -24) });
		markerCluster.addLayer(marker);
	});
	mainMap.addLayer(markerCluster);

	// -- Circle Of The Search Radius -- //
	var radius = L.circle(params.local, {
		radius: 1609.344 * params.radius,
		interactive: false,
		fillOpacity: 0.07,
		opacity: 0.4
	}).addTo(mainMap);

	var markerCluster;
}