const task = {};

task.clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}

task.updateDateTracker = (tracker, limit) =>
{
	let loaded = task.clone(tracker);

	let y = limit.year, m = limit.month, d = limit.day;
	let stop = false;
	while (!stop)
	{
		d--;
		if (d < 1) {m--; d = 31}
		if (m < 0) {y--; m = 11}
		let key = time.getKey(y, m, d);
		if (tracker[key[0]] !== undefined)
		{
			if (loaded[key[0]][key[1]] !== undefined)
			{
				loaded[key[0]][key[1]] = true;
			}
		}
		else { stop = true }
	}

	return loaded;
}

// async.ajaxCall('https://api.meetup.com/2/categories?&sign=true&photo-host=public&key=457b71183481b13752d69755d97632')
// 	.then(x => console.log(x.results))
