function Hybrid(textarea) {
	if (!window.getSelection) {
		alert("Your system is not supported");
	}

	var wysiwyg = new Wysiwyg(textarea)
	var markdown = new Markdown(textarea, wysiwyg.getWidget());
	var buttonArea = document.createElement('div');
	addButton("B", bold);
	addButton("I", italic);
	addButton("Switch Mode", switchMode);
	var currentMode = "text";
	textarea.parentNode.insertBefore(buttonArea, textarea);
	switchMode();
	
	function addButton(label, fnc) {
		var button = document.createElement('button');
		button.innerHTML = label;
		button.onclick = fnc;
		button.setAttribute("type", "button");
		
		buttonArea.appendChild(button);
	}
	
	function bold() {
		wysiwyg.bold();
	}
	
	function italic() {
		wysiwyg.italic();
	}
	
	function switchMode() {
		if (currentMode == "graphical") {
			markdown.show(wysiwyg.getTree());
			currentMode = "text";
		} else {
			wysiwyg.show(markdown.getTree());
			currentMode = "graphical";
		}
	}
}

function startHybrid(className) {
	var all = document.getElementsByClassName(className);
	for (i = 0; i < all.length; i++) {
		Hybrid(all[i]);
	}
	console.log("Start of app");
}
