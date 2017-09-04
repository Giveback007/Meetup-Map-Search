const task = {};

// -- clone -- //
task.clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}
// -- clone -- //

// -- updateDateTracker -- //
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
// -- updateDateTracker -- //

// -- capitalizeWords -- //
task.capitalizeWords = (x) =>
{
	let str = x.toLowerCase();
	let arr = str.split(' ');
	arr = arr.map(x => x.charAt(0).toUpperCase() + x.slice(1));
	return arr.join(' ');
}
// -- capitalizeWords -- //
