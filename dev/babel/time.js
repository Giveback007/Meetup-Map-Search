const time = {};

time.months =
	[
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getTimeObj = (unix, offset) =>
{
	const getTimeString = (t) =>
	{
		let hour = ((t.hour + 11) % 12 + 1);
		let amPm = t.hour < 12 ? 'am' : 'pm';
		let min = t.min === 0 ? '00' : t.min;
		let full =
			`${time.daysOfWeek[t.weekDay]}, ${time.months[t.month]}`
			+ ` ${t.day}, ${hour}:${min} ${amPm}`;
		return full;
	}

	let date = new Date(unix - offset);

	let obj =
	{
		unix: unix,
		offset: offset,
		year: date.getUTCFullYear(),
		month: date.getUTCMonth(),
		day: date.getUTCDate(),
		hour: date.getUTCHours(),
		min: date.getUTCMinutes(),
		weekDay: date.getUTCDay(),
	}
	obj.timeString = getTimeString(obj);
	obj.key = [`${obj.year}-${time.months[obj.month]}`, `${obj.day}`];

	return obj;
}

time.now = time.getTimeObj(
	new Date(), new Date().getTimezoneOffset() * 60000
);

time.getMonthLimit = (monthsFromNow) =>
{
	let date = new Date();
	let m = date.getUTCMonth();
	let y = date.getUTCFullYear();

	let lastDay = new Date(y, m + monthsFromNow + 1, 0);
	let end = lastDay.setHours(23, 59, 59, 999);

	return end;
}

time.createCalendarObj = (limit, tracker = false) =>
{
  let calendar = {};
	let months = [];
	let oneDay = 24 * 60 * 60 * 1000;
  let today = new Date().setUTCHours(23, 59, 59, 999);

	let lastDay = new Date(limit).setUTCHours(23, 59, 59, 999);
	let numDays = (lastDay - today) / oneDay;

	let now = time.getTimeObj(
    new Date(), new Date().getTimezoneOffset() * 60000
  );
	for (let i = 0; i < numDays; i++)
	{
		let refDay = new Date(now.year, now.month, now.day + i);
		let m = `${refDay.getFullYear()}-${time.months[refDay.getMonth()]}`
		let d = `${refDay.getDate()}`
		if (!calendar[m]) {calendar[m] = {}; months.push(m)}

		tracker ? calendar[m][d] = false : calendar[m][d] = [];
	}
  return {calendar, months};
}
