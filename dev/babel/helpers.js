// -- helpers -- //
const help = {};

help.ajaxCall = (url) =>
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

help.limiter = (meta) =>
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

help.months =
	[
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];

help.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

help.getTimeObj = (time) =>
{
	let date = new Date(time);
	return (
	{
		milis: time,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		min: date.getUTCMinutes(),
		weekDay: date.getUTCDay()
	});
}

help.getTimeString = (time) =>
{
	let hour = ((time.hour + 11) % 12 + 1);
	let amPm = time.hour < 12 ? 'am' : 'pm';
	let min = time.min === 0 ? '00' : time.min;
	let full =
		`${help.daysOfWeek[time.weekDay]}, ${help.months[time.month]}`
		+ ` ${time.day}, ${hour}:${min}${amPm}`;
	return full;
}

help.getMonthLimit = (monthsFromNow) =>
{
	let date = new Date();
	let m = date.getUTCMonth();
	let y = date.getUTCFullYear();

	let lastDay = new Date(y, m + monthsFromNow + 1, 0);
	let end = lastDay.setHours(23, 59, 59, 999);

	return end;
}

help.createCalendarObj = (limit) =>
{
  let calendar = {};
	let months = [];
	let oneDay = 24 * 60 * 60 * 1000;
  let today = new Date().setUTCHours(23, 59, 59, 999);

	let lastDay = new Date(limit).setUTCHours(23, 59, 59, 999);
	let numDays = (lastDay - today) / oneDay;

	let now = help.getTimeObj(
    new Date() - new Date().getTimezoneOffset() * 60000
  );
	for (let i = 0; i < numDays; i++)
	{
		let refDay = new Date(now.year, now.month, now.day + i);
		let m = `${refDay.getFullYear()}-${help.months[refDay.getMonth()]}`
		let d = `${refDay.getDate()}`
		if (!calendar[m]) {calendar[m] = {}; months.push(m)}
		calendar[m][d] = [];
	}
  return {calendar, months};
}

help.cloneObj = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}
// -- helpers -- //
