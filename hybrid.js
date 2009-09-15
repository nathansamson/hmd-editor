/**
 * The MIT License
 *
 * Copyright (c) 2009 Nathan Samson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
*/
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
