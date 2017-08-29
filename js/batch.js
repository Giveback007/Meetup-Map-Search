// function nextBatch() {
// 	batch = groups.slice(counter, (counter + params.api.rateLimit));
// 	counter += batch.length;
// 	console.log('batch ' + counter, batch); // temp
// 	if (batch.length > 0) {
//
// 		return new Promise((resolve) => {
// 			var resolveCounter = 0;
// 			batch.map(x => {
// 				ajaxCall(params.api.eventsURL(x))
// 					.then(x => {
// 						events.push(x.data);
// 						resolveCounter++;
// 						if (resolveCounter === batch.length) {
// 							// console.log('.map resolved at ' + resolveCounter); // temp
// 							resolve(true);
// 						}
// 					}).catch( x => console.log(x) );
// 			});
// 		});
//
// 	} else {
// 		resolve(events);
// 		// prevents batchLimiter from running again
// 		return new Promise((resolve) => resolve(false));
// 	}
// }

// params.api.limit = 0;
// function batchLimiter() {
// 		limiter().then(() => {
// 			nextBatch().then((x) => {
// 				if(x) {batchLimiter()}
// 			});
// 		});
// }

// batchLimiter();
