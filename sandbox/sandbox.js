// respond to incoming message with all processed images
window.addEventListener("message", (event) => {
	const { url, base64 } = event.data;
	
	// using promises to allow for asynchronous computing
	let metadataPromise = getData(url);
	let greyscalePromise = greyscale(base64);
	let elaPromise = ela(base64);
	let medianNoisePromise = extractNoiseMedianFilter(base64);
	let gaussianNoisePromise = extractNoiseGaussianBlur(base64);
	
	let promises = [ 
		metadataPromise, 
		greyscalePromise, 
		elaPromise, 
		medianNoisePromise,
		gaussianNoisePromise ];
		
	Promise.all(promises)
		.then((returned) => {
			var message = {};
			message['original'] = url;
			message['metadata'] = returned[0];
			
			var processed = {};
			processed['greyscale'] = returned[1];
			for(const [key, val] of Object.entries(returned[2])) {
				processed[key] = val;
			}
			processed['median filter noise'] = returned[3];
			processed['gaussian blur noise'] = returned[4];
			
			message['processed'] = processed;
			
			event.source.postMessage(message, event.origin);
		}).catch((error) => {
			console.log("rejected", error);
		});
});
