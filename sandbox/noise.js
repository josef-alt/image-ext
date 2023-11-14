function noise(base64) {
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
			
			function pos(x, y) {
				return (y * width + x) * 4;
			}
			function f(l, c, r) {
				const max = Math.max(l, c, r);
				const min = Math.min(l, c, r);
				const med = l ^ c ^ r ^ min ^ max;
				if(med == c)
					return 0;
				return 255;
			}
			
			var buffer = new Uint8ClampedArray(width * height * 4);
			
			for(var row = 1; row < height - 1; ++ row) {
				for(var col = 1; col < width - 1; ++col) {
					for(var cnl = 0; cnl < 4; ++cnl) {
						let left  = pixels[pos(row, col - 1)];
						let curr  = pixels[pos(row, col)];
						let right = pixels[pos(row, col + 1)];
						
						buffer[pos(row, col) + cnl] = f(left, curr, right);
					}
				}
			}
			for(var row = 1; row < height - 1; ++ row) {
				for(var col = 1; col < width - 1; ++col) {
					for(var cnl = 0; cnl < 4; ++cnl) {
						let above = pixels[pos(row - 1, col)];
						let curr  = pixels[pos(row, col)];
						let below = pixels[pos(row + 1, col)];
						
						buffer[pos(row, col) + cnl] = f(above, curr, below);
					}
				}
			}
			
			const outputCanvas = document.createElement("canvas");
			const outputContext = outputCanvas.getContext("2d");
			outputCanvas.width = width;
			outputCanvas.height = height;
			var imageData = outputContext.createImageData(width, height);
			imageData.data.set(buffer);
			outputContext.putImageData(imageData, 0, 0);
			const noise = outputCanvas.toDataURL("image/jpeg", 1);
			resolve(noise);
		}
		image.onerror = (error) => reject(error);
	});
}