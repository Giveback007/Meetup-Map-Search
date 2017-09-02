// const params =
// {
// 	totalMonths: 1 // no including this month
// }

const help = {};

help.clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}
