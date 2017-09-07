const task = {};

// -- clone -- //
task.clone = (obj) =>
{
	let clone = JSON.stringify(obj);
	return JSON.parse(clone);
}
// -- clone -- //

// -- isEqual -- //
task.isEqual = (obj1, obj2) =>
{
	return JSON.stringify(obj1) === JSON.stringify(obj2)
}
// -- isEqual -- //

// -- capitalizeWords -- //
task.capitalizeWords = (x) =>
{
	let str = x.toLowerCase();
	let arr = str.split(' ');
	arr = arr.map(x => x.charAt(0).toUpperCase() + x.slice(1));
	return arr.join(' ');
}
// -- capitalizeWords -- //
