// used to keep track of original image selected
var operating_list = new Map();

document.addEventListener('DOMContentLoaded', function () {
	const getbutton = document.getElementById("get_images");
	getbutton.addEventListener("click",  () => {
		getbutton.hidden = true;
		chrome.windows.getCurrent(w => {
			chrome.tabs.query({active: true, windowId: w.id}, function(tabs) {
				if(tabs) {
					var tab = tabs[0];
					if (tab.url) {
						if(tab.url.startsWith('chrome://')) {
							console.log('cannot run extension in chrome page');
						} else {
							execute(tab);
						}
					} else {
						console.log("tab not found")
					}
				} else {
					console.log("tabs not found")
				}
			});
		});
		
		// run filter functions when an image is selected
		document.getElementById("original_images")
			.addEventListener("click", function(e) {
				// make sure it is one of the page's original images being
				// selected, we don't want to analyse our own images
				if(e.target && !isDefined(e.target.closest("li li"))) {
					let image = e.target;
					if(!image.src)
						image = image.querySelector("img");
					
					const list = e.target.closest("li").querySelector("ul");
					
					// expected behavior:
					//		select an image = process the image
					//		select it again = hide processed images
					if(list.getElementsByTagName("li").length == 0) {
						const canvas = document.createElement("canvas");
						const W = image.naturalWidth;
						const H = image.naturalHeight;
						canvas.width = W;
						canvas.height = H;
						canvas.getContext("2d").drawImage(image, 0, 0, W, H);
						const base64 = canvas.toDataURL("image/png");
						
						// save to map
						operating_list.set(image.src, list);
						
						// send query to sandbox to process the selected image
						document.getElementById("sandbox").contentWindow
							.postMessage({ url: image.src, base64}, "*");
					} else {
						list.innerHTML = '';
					}
				}
			});
		return true;
	});
});

// display filtered/altered images below selected
window.addEventListener("message", (event) => {
	const { original, processed } = event.data;
	var source_list = operating_list.get(original);
	
	if(source_list) {
		if(event.data.metadata) {
			const new_li = document.createElement("li");
			const new_p = document.createElement("p");
			new_p.innerHTML = `Original Size: ${ event.data.metadata.width } <b>x</b> ${ event.data.metadata.height }`;
			new_li.appendChild(new_p);
			source_list.append(new_li);
		}
		
		// load each processed image into our sub-list
		for(const [ operation, alteredImage ] of Object.entries(processed)) {
			console.log("append", operation);
			const new_li = document.createElement("li");
			
			const new_i  = document.createElement("img");
			new_i.src = alteredImage;
			
			const new_label = document.createElement("figcaption");
			new_label.innerHTML = operation;
			
		  	new_li.appendChild(new_label);
			new_li.appendChild(new_i);
			
			source_list.append(new_li);
		}
	} else {
		console.log("list item not found");
	}
});

function isDefined(element) {
	return element !== null && element !== undefined;
}

function execute(tab) {
	chrome.scripting.executeScript({
		target: { tabId: tab.id, allFrames: true },
		function: get
	}, render);
}

// retrieve all images from a webpage
function get() {
	console.log("getting images");
	const images = document.getElementsByTagName("img");
	
	// filter out all the images too small to be important
	return Array.from(images)
		.filter(img => img.naturalWidth > 50 && img.naturalHeight > 50)
		.map(image => image.src);
}

// load retrieved images into popup
function render(images) {
	if(!images)
		return false;
	
	const template = document.getElementById("li_template");
	const elements = new Set();

	const imageUrls = images.map(im => im.result)
		.reduce((r1, r2) => r1.concat(r2));
	for (const img of imageUrls) {
		const element = template.content.firstElementChild.cloneNode(true);
		element.querySelector(".loadme").src = img;
		elements.add(element);
	}
	document.getElementById("original_images").append(...elements);
}

