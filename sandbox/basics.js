function getData(url) {
	console.log("getting data");
	const srcImg = new Image();
	srcImg.src = url;
	
	return new Promise((resolve, reject) => {
		srcImg.onload = function() {
			var data = {};
			data['height'] = srcImg.naturalHeight;
			data['width'] = srcImg.naturalWidth;
			resolve(data);
		};
		srcImg.onerror = (error) => reject(error);
	});
}

function greyscale(base64) {
	console.log("converting to greyscale");
	const srcImg = document.createElement("img");

	var greyscale;
	srcImg.src = base64;
	
	return new Promise((resolve, reject) => {
		srcImg.onload = function() {
			const src = cv.imread(srcImg);
			const outputCanvas = document.createElement("canvas");
			cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
			cv.imshow(outputCanvas, src);
			greyscale = outputCanvas.toDataURL("image/png");
			resolve(greyscale);
		};
		srcImg.onerror = (error) => reject(error);
	});
}