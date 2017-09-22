const time = {};

time.months =
	[
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getKey = (y, m, d) =>
{
	// return [`${y}-${m < 9 ? '0' + (m + 1): m + 1}`, `${d}`]; <- Diff key format
	return [`${y}-${time.months[m]}`, `${d}`];
}

time.getTimeObj = (unix, offset) =>
{
const getTimeString = (t, shortForm = false) =>
{
		let hour = ((t.hour + 11) % 12 + 1);
		let amPm = t.hour < 12 ? 'am' : 'pm';
		let min = t.min < 10 ? '0' + t.min : t.min;
		if (!shortForm)
		{
			return(
				`${time.daysOfWeek[t.weekDay]},` +
				` ${time.months[t.month]}` +
				` ${t.day}, ${hour}:${min} ${amPm}`
			);
		}
		else
		{
			return(
				`${time.daysOfWeek[t.weekDay]},` +
				` ${time.months[t.month]}` +
				` ${t.day}`
			)
		}
	}

	let date = new Date(unix - offset);

	let obj =
	{
		unix: new Date(unix),
		offset: offset,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		min: date.getUTCMinutes(),
		weekDay: date.getUTCDay(),
	}
	obj.timeString = getTimeString(obj);
	obj.timeStringShort = getTimeString(obj, true)
	obj.key = time.getKey(obj.year, obj.month, obj.day);

	return obj;
}

time.now = time.getTimeObj(
	new Date(), new Date().getTimezoneOffset() * 60000
);

time.getDayLimit = (daysFromNow) =>
{
	const now = time.now;
	const lastDay = new Date(now.year, now.month, now.day + daysFromNow);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.getWeekLimit = (weeksFromNow) =>
{
	const now = time.now;
	const day = now.day + (6 - now.weekDay) + (weeksFromNow * 7);
	const lastDay = new Date(now.year, now.month, day);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.getMonthLimit = (monthsFromNow) =>
{
	const now = time.now;
	const lastDay = new Date(now.year, now.month + monthsFromNow + 1, 0);
	const end = lastDay.setHours(23, 59, 59, 999);
	const offset = new Date(end).getTimezoneOffset() * 60000;

	return time.getTimeObj(end, offset);
}

time.createWeekObj = (weeksFromNow) =>
{
	let weekObj = [];
	let day = time.getDayLimit(0);
	let week = time.getWeekLimit(weeksFromNow);
	let t = (week.unix - day.unix) / 1000 / 60 / 60 / 24;
	while (weekObj.length < 7)
	{
		let tempObj = time.getDayLimit(t);
		if (t < 0) {tempObj.inactive = true}
		weekObj.unshift(tempObj);
		t--;
	}
	return weekObj;
}


time.createCalendarObj = (limit, tracker = false) =>
{
	let now = time.now;
  let calendar = {};
	let oneDay = 24 * 60 * 60 * 1000;

  let today = Date.UTC(now.year, now.month, now.day, 23, 59, 59, 999);
	let lastDay = Date.UTC(limit.year, limit.month, limit.day, 23, 59, 59, 999);

	let numDays = (lastDay - today) / oneDay;

	for (let i = 0; i <= numDays; i++)
	{
		let refDay = new Date(now.year, now.month, now.day + i);
		let key = time.getKey(refDay.getFullYear(), refDay.getMonth(), refDay.getDate())
		let m = key[0], d = key[1];
		if (!calendar[m]) {calendar[m] = {}}

		tracker ? calendar[m][d] = false : calendar[m][d] = [];
	}
  return calendar;
}

// time.updateDateTracker = (tracker, limit) =>
// {
// 	let loaded = task.clone(tracker);
//
// 	let y = limit.year, m = limit.month, d = limit.day;
// 	let stop = false;
// 	while (!stop)
// 	{
// 		d--;
// 		if (d < 1) {m--; d = 31}
// 		if (m < 0) {y--; m = 11}
// 		let key = time.getKey(y, m, d);
// 		if (tracker[key[0]] !== undefined)
// 		{
// 			if (loaded[key[0]][key[1]] !== undefined)
// 			{
// 				loaded[key[0]][key[1]] = true;
// 			}
// 		}
// 		else { stop = true }
// 	}
//
// 	return loaded;
// }
