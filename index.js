var operating_list;

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
		
		document.getElementById("original_images")
			.addEventListener("click", function(e) {
				if(e.target && !isDefined(e.target.closest("li li"))) {
					const image = e.target.src ? e.target : e.target.querySelector("img");
					const list = e.target.closest("li").querySelector("ul");
					
					operating_list = list;
					if(operating_list.getElementsByTagName("li").length == 0) {
					
						const canvas = document.createElement("canvas");
						canvas.width = image.naturalWidth;
						canvas.height = image.naturalHeight;
						canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
						const base64 = canvas.toDataURL("image/png");
						
						document.getElementById("sandbox").contentWindow.postMessage({ url: image.src, base64}, "*");
					} else {
						operating_list.innerHTML = '';
					}
				}
			});
		return true;
	});
});

window.addEventListener("message", (event) => {
	const { original, processed } = event.data;

	if(operating_list) {
		if(event.data.metadata) {
			const new_li = document.createElement("li");
			const new_p = document.createElement("p");
			new_p.innerHTML = `Original Size: ${ event.data.metadata.width } <b>x</b> ${ event.data.metadata.height }`;
			new_li.appendChild(new_p);
			operating_list.append(new_li);
		}
		for(const [ operation, alteredImage ] of Object.entries(processed)) {
			console.log("append", operation);
			const new_li = document.createElement("li");
			
			const new_i  = document.createElement("img");
			new_i.src = alteredImage;
			
			const new_label = document.createElement("figcaption");
			new_label.innerHTML = operation;
			
		  	new_li.appendChild(new_label);
			new_li.appendChild(new_i);
			
			operating_list.append(new_li);
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

function get() {
	console.log("getting images");
	const images = document.getElementsByTagName("img");
	
	return Array.from(images)
		.filter(img => img.naturalWidth > 50 && img.naturalHeight > 50)
		.map(image => image.src);
}

function render(images) {
	if(!images)
		return false;
	
	const template = document.getElementById("li_template");
	const elements = new Set();

	const imageUrls = images.map(im => im.result).reduce((r1, r2) => r1.concat(r2));
	for (const img of imageUrls) {
		const element = template.content.firstElementChild.cloneNode(true);
		element.querySelector(".loadme").src = img;
		elements.add(element);
	}
	document.getElementById("original_images").append(...elements);
}

