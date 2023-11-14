function ela(base64) {
	console.log("error level analysis");

	const comp_q1 = 95;
	const comp_q2 = 90;
	const scale = 4;

	var image = new Image();
	image.src = base64;
	return new Promise((resolve, reject) => {
		image.onload = function() {
			const { width, height } = image;
		
			var compressionCanvas = document.createElement('canvas');
			compressionCanvas.width = width;
			compressionCanvas.height = height;
				
			var compressionContext = compressionCanvas.getContext("2d");
			compressionContext.drawImage(image, 0, 0, width, height);
					
			const comped1 = compressionCanvas.toDataURL("image/jpeg", comp_q1 * 0.01);
			
			var compressed = new Image();
			compressed.src = comped1;
			compressed.onload = function() {
				var image1 = cv.imread(compressed);

				const difference = new cv.Mat(height, width, cv.CV_64F);
				cv.absdiff(cv.imread(image), image1, difference);
				cv.convertScaleAbs(difference, difference, scale, 0);
						
				cv.cvtColor(difference, difference, cv.COLOR_BGRA2RGB);
				cv.imshow(compressionCanvas, difference);
				const diffURL1 = compressionCanvas.toDataURL("image/jpeg", 1);
				
				compressionContext.drawImage(compressed, 0, 0, width, height);
				const comped2 = compressionCanvas.toDataURL("image/jpeg", comp_q2 * 0.01);
				var compressed2 = new Image();
				compressed2.src = comped2;
				compressed2.onload = function() {
					var image2 = cv.imread(compressed2);
					const difference2 = new cv.Mat(height, width, cv.CV_64F);
					cv.absdiff(image1, image2, difference2);
					cv.convertScaleAbs(difference2, difference2, scale, 0);
					
					cv.cvtColor(difference, difference2, cv.COLOR_BGRA2RGB);
					cv.imshow(compressionCanvas, difference2);
					const diffURL2 = compressionCanvas.toDataURL("image/jpeg", 1);
					
					result = {}
					result[`error-level analysis ${ comp_q1 }`] = diffURL1;
					result[`error-level analysis ${ comp_q2 }`] = diffURL2;
					resolve(result);
				};
				compressed2.onerror = (error) => reject(error);
			}
			compressed.onerror = (error) => reject(error);
		};
		image.onerror = (error) => reject(error);

	});
}