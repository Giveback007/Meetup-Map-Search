/*
'use strict';

// -- Prep -- //
function ajaxCall(url) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: url,
			type: 'get',
			dataType: "jsonp",
			success: (x) => {resolve(x)},
			error: (err) => {reject(err)}
		});
	});
}

// meetup API has a limit of calls that can be made per a set amount of time
// this limiter prevent throttling due to exceeding of said limit
function limiter(meta) {
	let limit = Number(meta['X-RateLimit-Remaining']), reset = Number(meta['X-RateLimit-Reset']);
	console.log('limit ' + limit, 'reset ' + reset)
	return new Promise((resolve, reject) => {
		if (limit <= 1) {
			console.log('limit ' + reset + ' seconds until reset'); // temp -- change to load counter
			setTimeout(resolve, (reset * 1000) + 500);
		} else {
			resolve();
		}
	});
}

let mem = {};

let params = {
	meetupKey: '457b71183481b13752d69755d97632',
	local: ['41.957819', '-87.994403'],
	category: 34, // 34 -> tech
	page: 200, // max 200
	radius: 10.00, // max 100.00,
	api: {}
}

params.api.groupsURL = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&upcoming_events=true&lon=${params.local[1]}&radius=${params.radius}&category=${params.category}&lat=${params.local[0]}&order=distance&page=${params.page}&key=${params.meetupKey}`;
params.api.eventsURL = function(group) {
	return `https://api.meetup.com/${group}/events?&sign=true&photo-host=public&desc=true&status=upcoming&page=10&key=${params.meetupKey}`
}
// -- Prep -- //

// -- findGroups -- //
function findGroups() {
	return new Promise((resolve, reject) => {

		let groups = [];
		let fullGroupData = [];

		function nextPage(result) {

			let tempArr = result.data.map(x => x.urlname)
			groups = groups.concat(tempArr);
			fullGroupData = fullGroupData.concat(result.data);

			if (result.meta.next_link) {
				limiter(result.meta).then(() => {
					ajaxCall(result.meta.next_link + '&key=' + params.meetupKey)
						.then(x => nextPage(x) ).catch( x => console.log(x) );
				});
			} else {
				mem.fullGroupData = fullGroupData;
				console.log(mem.fullGroupData);
				resolve(groups); // return aggregate groups
			}

		}

		ajaxCall(params.api.groupsURL)
			.then(x => {
				nextPage(x);
			}).catch( x => console.log(x) );

	});
}
// -- findGroups -- //

// -- findEvents -- //
function findEventsByGroup(groups) {
	console.log('groups', groups.length); // temp

	return new Promise((resolve, reject) => {
		let counter = 0;
		let events = [];

		function nextGroup(result) {
			counter++;
			result.data.map(x => events.push(x));
			if (counter < groups.length) {
				limiter(result.meta).then(() => {
					ajaxCall(params.api.eventsURL(groups[counter]))
						.then(x => {
							nextGroup(x)
						}).catch( x => console.log(x) );
				});
			} else {
				console.log('end');
				mem.fullEventsData = events;
				resolve(events); // return aggregate groups
			}

		}

		ajaxCall(params.api.eventsURL(groups[counter]))
			.then(x => {
				nextGroup(x)
			}).catch(x => console.log(x));

	});

}
// -- findEvents -- //

// -- organizeData -- //
function organizeData() {
	mem.groups = {};
	mem.events = [];
	for (var i = 0; i < mem.fullGroupData.length; i++) {
		let group = mem.fullGroupData[i];
		mem.groups[group.urlname] = {
			name: group.name,
			url: group.urlname,
			loc: [group.lat, group.lon],
			members: group.members,
			img: group.group_photo ? group.group_photo.thumb_link : false
		}
	}

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	function getTime(time) {
		let date = new Date(time);
		return {
			unix: time,
			year: date.getUTCFullYear(),
			month: date.getUTCMonth(),
			day: date.getUTCDate(),
			hour: date.getUTCHours(),
			min: date.getUTCMinutes(),
			weekDay: weekDays[date.getUTCDay()]
		}
	}

	mem.events = mem.fullEventsData.map(x => {
		return {
			name: x.name,
			group: x.group.urlname,
			loc: x.venue ? [x.venue.lat, x.venue.lon] : false,
			time: getTime(x.time + x.utc_offset),
			duration: x.duration / 60000 || null,
			link: x.link
		}
	});
	mem.events.sort((a, b) => a.time.unix - b.time.unix)
	console.log(mem.events);
}
// -- organizeData -- //

findGroups().then(x => {
	findEventsByGroup(x).then(() => organizeData());
});
*/
