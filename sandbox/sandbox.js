window.addEventListener("message", (event) => {
	const { url, base64 } = event.data;
	
	let metadataPromise = getData(url);
	let greyscalePromise = greyscale(base64);
	let elaPromise = ela(base64);
	let noisePromise = noise(base64);
	Promise.all([ metadataPromise, greyscalePromise, elaPromise, noisePromise ])
		.then((returned) => {
			var message = {};
			message['original'] = url;
			message['metadata'] = returned[0];
			
			var processed = {};
			processed['greyscale'] = returned[1];
			for(const [key, val] of Object.entries(returned[2])) {
				processed[key] = val;
			}
			processed['noise'] = returned[3];
			message['processed'] = processed;
			
			event.source.postMessage(message, event.origin);
		}).catch((error) => {
			console.log("rejected", error);
		});
});