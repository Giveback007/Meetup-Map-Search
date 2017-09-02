const async = {};
// -- ajaxCall -- //
async.ajaxCall = (url) =>
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
// -- ajaxCall -- //

// -- limiter -- //
async.limiter = (meta) =>
{
	let limit = Number(meta['X-RateLimit-Remaining']);
	let reset = Number(meta['X-RateLimit-Reset']);
	console.log('limit left ' + limit, ', reset ' + reset) // temp
	return new Promise((resolve, reject) =>
	{
		if (limit <= 1)
		{
			console.log('limit reached, ' + reset + ' seconds until reset'); // temp
			setTimeout(resolve, (reset * 1000) + 500);
		}
		else
		{
			resolve();
		}
	});
}
// -- limiter -- //

// -- geoLocate -- //
async.geoLocate = () =>
{
	return new Promise((resolve, reject) =>
	{
		resolve([41.957819, -87.994403]); // temp
		const options =
		{
			enableHighAccuracy: true,
			maximumAge: Infinity
		}
		const success = (pos) =>
		{
			let crd = pos.coords;
			resolve([crd.latitude, crd.longitude]);
		}
		const error = (err) =>
		{
			console.log(err, 'put in custom location');
			resolve([41.957819, -87.994403]);
		}
		// navigator.geolocation.getCurrentPosition(success, error, options);
	});
}
// -- geoLocate -- //

// -- findEvents -- //
async.findEvents = (url, allEvents) =>
{
	return new Promise((resolve, reject) =>
	{
		const parseData = (dt) =>
		{
			let events = help.clone(allEvents);
			// Forms the data
			let data = dt.data.map(x =>
			{
				let obj = x;
				obj.loc = obj.venue ?
					[obj.venue.lat, obj.venue.lon] : null;
				obj.time = time.getTimeObj(obj.time, obj.utc_offset * -1);
				obj.duration = obj.duration / 60000 || null;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});

			// Merges the data into existing calendar form
			data.map(x => {
				let key = x.time.key;
				if (!events[key[0]]) {return}
				events[key[0]][key[1]]
					.push(x);
			});

			let obj = {};
			obj.events = events;
			obj.meta = dt.meta;
			obj.lastEventTime = data[data.length - 1].time;

			return obj; // <-
		}

		async.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
}
// -- findEvents -- //
