// -- geoLocate -- //
const geoLocate = () =>
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
const findEvents = (url, allEvents) =>
{
	return new Promise((resolve, reject) =>
	{
		const parseData = (dt) =>
		{
			let events = help.cloneObj(allEvents);
			// Make the data more usable
			let data = dt.data.map(x =>
			{
				let obj = x;
				obj.loc = obj.venue ?
					[obj.venue.lat, obj.venue.lon] : null;
				obj.time = help.getTimeObj(obj.time + obj.utc_offset);
				obj.duration = obj.duration / 60000 || null;
				delete obj.utc_offset;
				delete obj.venue;
				return obj;
			});

			// Put the data in calendar form
			data.map(x => {
				let m = `${x.time.year}-${help.months[x.time.month]}`;
				let d = `${x.time.day}`;
				if (!events[m]) {return}
				events[m][d]
					.push(x);
			})

			let obj = {}
			obj.events = events;
			obj.meta = dt.meta;

			resolve(obj);
		}

		help.ajaxCall(url).then( x => resolve(parseData(x)) );
	});
}
// -- findEvents -- //
