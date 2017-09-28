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
				// console.log('ajax', x); // temp
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
	console.log('calls left ' + limit, ', reset in ' + reset + ' sec') // temp
	return new Promise((resolve, reject) =>
	{
		if (limit <= 5)
		{
			console.log('limit reached, ' + reset + ' seconds until reset'); // temp
			setTimeout(resolve, (reset * 1000) + 500);
		}
		else
		{
			resolve();
		}
	});
};
// -- limiter -- //

// -- geoLocate -- //
async.geoLocate = () =>
{
	return new Promise((resolve, reject) =>
	{
		const options = {maximumAge: Infinity}
		const success = (pos) =>
		{
			let crd = pos.coords;
			resolve([crd.latitude, crd.longitude]);
		}
		const error = (err) =>
		{
			resolve(false)
		}
		navigator.geolocation.getCurrentPosition(success, error, options);
	});
};
// -- geoLocate -- //

// -- findEvents -- //
async.overflowEvents = [];
async.findEvents = (url, allEvents) =>
{
	return new Promise((resolve, reject) =>
	{
		const parseData = (dt) =>
		{
			let events = task.clone(allEvents);
			// Forms the data
			let data = dt.data.map(x =>
			{
				let obj = x;
				obj.loc = obj.venue ?
					[obj.venue.lat, obj.venue.lon] : null;
				obj.time = time.getTimeObj(obj.time, obj.utc_offset * -1);
				obj.duration = obj.duration / 60000 || null;
				if (!obj.group.category) {console.log('No Category!',obj); return;}
				obj.category = obj.group.category.name;
				delete obj.group.category;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});

			// Merge data with overflow
			// let overflow = task.clone(async.overflowEvents);
			// async.overflowEvents = [];
			// let newData = data.concat(overflow);

			// Merge the data into existing calendar
			data.map(x => {
				if (!x) {console.log('Undefined!');return;}
				let key = x.time.key;
				if (!events[key[0]] || !events[key[0]][key[1]])
				{
					async.overflowEvents.push(x);
					return;
				}
				events[key[0]][key[1]].push(x);
			});

			let obj = {};
			obj.events = events;
			obj.meta = dt.meta;
			obj.lastEventTime = data[data.length - 1].time;

			return obj; // <-
		}

		async.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
};
// -- findEvents -- //

// -- getCategories -- //
async.getCategories = (url) =>
{
	return new Promise((resolve) => {
		function parseData(data)
		{
			let arr = [];
			data.results.map(x =>
			{
				arr.push(x.name);
			});
			return arr;
		}
		async.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
};
// -- getCategories -- //

// -- reverseGeo -- //
async.reverseGeo = (loc) =>
{
	return new Promise(resolve => {
		async.ajaxCall(`https://geocode.xyz/${loc[0]},${loc[1]}?geoit=json`)
			.then(x =>
			{
				let state = x.prov.toUpperCase();
				let city = task.capitalizeWords(x.city);
				resolve(`${city}, ${state}`);
			});
	});
};
// -- reverseGeo -- //

// -- geocode -- //
async.geocode = (locStr) =>
{
	return new Promise(resolve => {
		async.ajaxCall(`https://geocode.xyz/${locStr}?geoit=json`)
			.then(x =>
				{
					if(x.error)
					{
						console.log('x.error', x);
						console.log('geocode error handeled');
						resolve([false, 'Location Not Found, Please Try Again']);
						return;
					}
					if (x.standard.countryname === 'United States of America')
					{
						console.log('success geocode', x);
						resolve([true, [x.latt, x.longt]])
					}
					else
					{
						console.log('fail geocode', x);
						resolve(async.geocode(`${locStr}%20usa`))
					}
				});
	});
};
// -- geocode -- //
