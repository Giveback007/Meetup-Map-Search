'use strict';

// -- Prep -- //
function ajaxCall(url) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: url,
			type: 'get',
			dataType: "jsonp",
			success: (x) => {
				console.log(x);
				if (x.errors) {
					console.log(x.errors)
					reject(x.errors)
				}
				// if (x.meta) {
				// 	params.api.rateLimit = Number(x.meta['X-RateLimit-Limit']);
				// 	params.api.limit = Number(x.meta['X-RateLimit-Remaining']);
				// 	params.api.reset = Number(x.meta['X-RateLimit-Reset']);
				// }
				resolve(x);
			},
			error: (err) => { reject(err) }
		});
	});
}

// meetup API has a limit of calls that can be made per a set amount of time
// this limiter prevent throttling due to exceeding of said limit
function limiter(meta) {
	let limit = Number(meta['X-RateLimit-Remaining']), reset = Number(meta['X-RateLimit-Reset']);
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
	local: {lat: '41.957819', lon:'-87.994403'},
	category: 34, // 34 -> tech
	page: 200, // max 200
	radius: 20.00, // max 100.00,
	api: {}
}

params.api.groupsURL = `https://api.meetup.com/find/groups?&sign=true&photo-host=public&upcoming_events=true&lon=${params.local.lon}&radius=${params.radius}&category=${params.category}&lat=${params.local.lat}&order=distance&page=${params.page}&key=${params.meetupKey}`;
params.api.eventsURL = function(group) {
	return `https://api.meetup.com/${group}/events?&sign=true&photo-host=public&desc=true&status=upcoming&page=10&key=${params.meetupKey}`
}
// -- Prep -- //

// -- findGroups -- //
function findGroups() {
	return new Promise((resolve, reject) => {

		let groups = [];

		function nextPage(result) {

			let tempArr = result.data.map(x => x.urlname)
			groups = groups.concat(tempArr);

			if (result.meta.next_link) {
				limiter(result.meta).then(() => {
					ajaxCall(result.meta.next_link + '&key=' + params.meetupKey)
						.then(x => nextPage(x) ).catch( x => console.log(x) );
				});
			} else {
				mem.groups = groups;
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
				mem.events = events;
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

findGroups().then(x => {
	findEventsByGroup(x).then(x => console.log(x))
});
