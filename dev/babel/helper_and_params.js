// const params =
// {
// 	totalMonths: 1 // no including this month
// }

// const help = {};

const clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}

// async.ajaxCall('https://api.meetup.com/2/categories?&sign=true&photo-host=public&key=457b71183481b13752d69755d97632')
// 	.then(x => console.log(x.results))
