// extract noise from an image
function extractNoiseMedianFilter(base64) {
	console.log("noise");
	var image = new Image();
	image.src = base64;
	
	return new Promise((resolve, reject) => {
		image.onload = function() {
			const height = image.naturalHeight;
			const width = image.naturalWidth;
			
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			canvas.width = width;
			canvas.height = height;
			context.drawImage(image, 0, 0);
			const pixels = context.getImageData(0, 0, width, height).data;
			
			const pos = (y, x) => {
				return y * (width * 4) + x * 4;
			}
			
			const median = arr => {
				const mid = 4;
				const nums = [...arr].sort((a, b) => a - b);
				return nums[mid];
			};
			
			const f = arr => {
				const mid = arr[4];
				if(median(arr) == mid)
					return 0;
				return 255;
			};
			
			// store the extracted noise
			var buffer = new Uint8ClampedArray(width * height * 4);
			for(var row = 1; row < height - 1; ++row) {
				for(var col = 1; col < width - 1; ++col) {	
					let val = f([
						pixels[pos(row - 1, col - 1)], 
						pixels[pos(row - 1, col)],
						pixels[pos(row - 1, col + 1)],
						pixels[pos(row, col - 1)],
						pixels[pos(row, col)],
						pixels[pos(row, col + 1)],
						pixels[pos(row + 1, col - 1)],
						pixels[pos(row + 1, col)],
						pixels[pos(row + 1, col + 1)]]);
						
					for(var cnl = 0; cnl < 3; ++cnl) {
						buffer[pos(row, col) + cnl] = val;
					}
					buffer[pos(row, col) + 3] = 255;
				}
			}
			
			// convert our buffer into an image
			const outputCanvas = document.createElement("canvas");
			const outputContext = outputCanvas.getContext("2d");
			outputCanvas.width = width;
			outputCanvas.height = height;
			var imageData = outputContext.createImageData(width, height);
			imageData.data.set(buffer);
			outputContext.putImageData(imageData, 0, 0);
			
			// resolve promise with our data url
			const noise = outputCanvas.toDataURL("image/jpeg", 1);
			resolve(noise);
		}
		image.onerror = (error) => reject(error);
	});
}

function extractNoiseGaussianBlur(base64) {
	console.log("blur noise");
	var srcImg = new Image();
	srcImg.src = base64;
	
	return new Promise((resolve, reject) => {
		srcImg.onload = function() {
			const orig = cv.imread(srcImg);
			let blurred = new cv.Mat();
			let ksize = new cv.Size(5, 5);
			cv.GaussianBlur(orig, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);

			const outputCanvas = document.createElement("canvas");
			
			let diff = new cv.Mat();
			cv.absdiff(orig, blurred, diff);
			cv.convertScaleAbs(diff, diff, 2.5, 0);
			cv.cvtColor(diff, diff, cv.COLOR_BGRA2RGB);
			
			cv.imshow(outputCanvas, diff);
			let result = outputCanvas.toDataURL("image/jpeg", 1);
			
			resolve(result);
		}
		srcImg.onerror = (error) => reject(error);
	});
}