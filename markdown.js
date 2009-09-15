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
function Markdown(area, wysiwygWidget) {
	var textarea = area;
	var wysiwyg = wysiwygWidget;
	
	this.getTree = function () {
		return ['markdown', ['bold', 'dit is vet en ', ['italic', 'italic']]];
	}
	
	this.show = function (newTree) {
		textarea.value = getText(newTree);
		wysiwyg.parentNode.replaceChild(textarea, wysiwyg);
	}
	
	/* Private functions */
	
	function getText(sub) {
		var text = '';
		
		if (typeof(sub) == 'string') {
			text += sub;
		} else if (sub[0] == 'bold') {
			text += '*';
			for (var j = 1; j < sub.length; j++) {
				text += getText(sub[j]);
			}
			text += '*';
		} else if (sub[0] == 'italic') {
			text += '**';
			for (var j = 1; j < sub.length; j++) {
				text += getText(sub[j]);
			}
			text += '**'
		} else if (sub[0] == 'markdown') {
			for (var j = 1; j < sub.length; j++) {
				text += getText(sub[j]);
			}
		}
		return text;
	}
}
