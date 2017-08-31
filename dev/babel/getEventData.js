// -- helpers -- //
function ajaxCall(url)
{
	return new Promise((resolve, reject) =>
	{
		$.ajax
		({
			url: url,
			type: 'get',
			dataType: "jsonp",
			success: (x) =>
			{
				console.log('ajax', x); // temp
				resolve(x)
			},
			error: (err) =>
			{
				reject(err)
			}
		});
	});
}

function limiter(meta)
{
	let limit = Number(meta['X-RateLimit-Remaining']);
	let reset = Number(meta['X-RateLimit-Reset']);
	// console.log('limit left ' + limit, ', reset ' + reset) // temp
	return new Promise((resolve, reject) =>
	{
		if (limit <= 1)
		{
			console.log('limit reached, ' + reset + ' seconds until reset'); // temp -- change to load counter
			setTimeout(resolve, (reset * 1000) + 500);
		}
		else
		{
			resolve();
		}
	});
}

let months =
	[
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];

let daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTimeObj(time)
{
	let date = new Date(time);
	return (
	{
		unix: time,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		min: date.getUTCMinutes(),
		weekDay: date.getUTCDay()
	});
}

function getTimeString(time)
	{
		let hour = ((time.hour + 11) % 12 + 1);
		let amPm = time.hour < 12 ? 'am' : 'pm';
		let min = time.min === 0 ? '00' : time.min;
		let full = `${daysOfWeek[time.weekDay]}, ${months[time.month]} ${time.day}, ${hour}:${min}${amPm}`;
		return full;
	}

function createDaysObj() {

}

function dateLimit(monthsFromNow) {
	let date = new Date();
	let m = date.getMonth();
	let y = date.getFullYear();

	let lastDay = new Date(y, m + monthsFromNow + 1, 0);
	let end = lastDay.setHours(23, 59, 59, 999);

	return end;
}
// -- helpers -- //


// -- findEvents -- //
function findEvents(url, dateLimit, key)
{
	let events = [];
	return new Promise((resolve, reject) =>
	{
		// -- nextPage -- //
		function nextPage(result)
		{
			let tempArr = result.data.map(x =>
			{
				let obj = x;
				obj.loc = obj.venue ?
					[obj.venue.lat, obj.venue.lon] : null;
				obj.time = getTimeObj(obj.time + obj.utc_offset);
				obj.duration = obj.duration / 60000 || null;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});
			events = events.concat(tempArr);

			let lastDate = tempArr[tempArr.length - 1].time.unix;

			if (result.meta.next_link && lastDate < dateLimit)
			{
				limiter(result.meta).then(() =>
				{
					ajaxCall(result.meta.next_link + `&key=${key}`)
						.then(x => nextPage(x))
				});
			}
			else
			{
				console.log('find events', events); // temp
				// params.mem.next_link = result.meta.next_link
				resolve(events)
			}

		}
		// -- nextPage -- //
		ajaxCall(url).then(x => nextPage(x));
	});
}

// -- event data -- //
let params =
{
	// meetupKey: '457b71183481b13752d69755d97632',
	// local: ['41.957819', '-87.994403'],
	// radius: 10, // max 100.00
	//
	// api:
	// {
	// 	omit: `description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url`,
	// 	eventUrl: function()
	// 	{
	// 		return `https://api.meetup.com/find/events?&sign=true&photo-host=public&lat=${params.local[0]}&lon=${params.local[1]}&radius=${params.radius}&fields=group_photo,group_category&omit=${params.api.omit}&key=${params.meetupKey}`
	// 	}
	// },
	mem: {}
}

// params.mem.events = findEvents(params.api.eventUrl(), params.dateLimit);

// params.mem.events.then(x => renderMap(params.local, x));
