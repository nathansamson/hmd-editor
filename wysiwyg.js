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
function Wysiwyg(origTextarea) {
	var textarea = origTextarea;
	var widget = document.createElement('div');
	widget.setAttribute("contentEditable", "true");
	widget.setAttribute("class", "editor");
	
	this.show = function (tree) {
		// Clean my inner DOM
		widget.innerHTML = '';
		applyTree(tree, widget);
		textarea.parentNode.replaceChild(widget, textarea);
	}
	
	this.bold = function () {
		applyTag("strong");
	}
	
	this.italic = function () {
		applyTag("em");
	}
	
	this.getTree = function () {
		return ['markdown'].concat(buildTree(widget.childNodes));
	}
	
	this.getWidget = function () {
		return widget;
	}

	/* Private functions */

	function applyTree(tree, node) {
		var el = null;
		if (typeof(tree) == 'string') {
			el = document.createTextNode(tree);
		} else if (tree[0] == 'markdown') {
			el = node;
		} else if (tree[0] == 'bold') {
			el = document.createElement('strong');
		} else if (tree[0] == 'italic') {
			el = document.createElement('em');
		} else {
			//console.log("Internal error");
			return;
		}
		if (typeof(tree) != 'string') {
			for (var i = 1; i < tree.length; i++) {
				applyTree(tree[i], el);
			}
		}
		
		if (el != node) {
			node.appendChild(el);
		}
	}
	
	function buildTree (nodes) {
		var tree = [];
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var subTree = null;
			if (node.nodeName.toLowerCase() == 'strong') {
				subTree = ['bold'];
			} else if (node.nodeName.toLowerCase() == 'em') {
				subTree = ['italic'];
			} else if (node.nodeName == '#text') {
				subTree = node.data;
			} else {
				//console.log(node.nodeName);
			}
			if (node.childNodes.length > 0) {
				subTree = subTree.concat(buildTree(node.childNodes));
			}
			
			if (subTree != null) {
				tree.push(subTree);
			}
		}
		return tree;
	}
	
	function applyTag(tag) {
		select = window.getSelection();
		
		if (hasTag(select.anchorNode, tag)) {
			if (select.anchorNode == select.focusNode) {
				
				// Uptree is an array, with all parent nodes of the
				// Selected node + next Siblings of these parent nodes
				var upTree = [];
				var anchorSiblings = [];
				sibling = select.anchorNode.nextSibling;
				while (sibling != null) {
					anchorSiblings.push(sibling);
					sibling = sibling.nextSibling;
				}
				var node = select.anchorNode;
				var i = 0;
				do {
					node = node.parentNode;
					var siblings = [];
					sibling = node.nextSibling;
					while (sibling != null) {
						console.log(sibling);
						siblings.push(sibling);
						sibling = sibling.nextSibling;
					}
					upTree.push([node, siblings]);
					i = i + 1;
				} while (node.tagName.toLowerCase() != tag && node.tagName.toLowerCase() != 'div')
				
				if (select.anchorOffset < select.focusOffset) {
					start = select.anchorOffset;
					end = select.focusOffset;
				} else {
					start = select.focusOffset;
					end = select.anchorOffset;
				}
				first = select.anchorNode.data.substr(0, start);
				selected = select.anchorNode.data.substr(start, end - start);
				last = select.anchorNode.data.substr(end);
				firstText = document.createTextNode(first);
				selectedText = document.createTextNode(selected);
				lastText = document.createTextNode(last);
				
				upTree[0][0].replaceChild(firstText, select.anchorNode);
				// Do not include upTree[last], this is the tag we want to delete
				var parentNode = upTree[upTree.length-1][0].parentNode;
				var beforeNode = upTree[upTree.length-1][0].nextSibling;
				if (upTree.length > 1) {
					for (var i = upTree.length - 2; i >= 0; i--) {
					
						var node = upTree[i][0].cloneNode(false);
						if (i == upTree.length - 2) {
							var upperSelected = node;
						}
						if (i == 0) {
							// Add the selected text in this node
							node.appendChild(selectedText);
						
							// We also have to reinsert lastText, but we have to open the deleted node first.
							var deleted = upTree[upTree.length-1][0].cloneNode(false);
							deleted.appendChild(lastText);
							node.appendChild(deleted);
						}
						if (beforeNode != null) {
							parentNode.insertBefore(node, beforeNode);
						} else {
							parentNode.appendChild(node);
						}
						beforeNode = null;
						parentNode = node;
					}
					// Traverse the upTree once again, to recreate the siblings

					var parentNode = upperSelected.parentNode;
					var beforeNode = upperSelected.nextSibling;
					for (var i = upTree.length-1; i > 0; i--) {
						var node = upTree[i][0].cloneNode(false);
						if (i > 0) {
							// Append the siblings
							for (var j = 0; j < upTree[i-1][1].length; j++) {
								var sibling = upTree[i-1][1][j];
								sibling.parentNode.removeChild(sibling);
								node.appendChild(sibling);
							}
						}
						parentNode.appendChild(node);
						parentNode = node;
					}
				} else {
					console.log(upTree);
					var original = upTree[0][0];
					console.log(original);
					if (original.nextSibling) {
						original.parentNode.insertBefore(selectedText, original.nextSibling);
					} else {
						original.parentNode.appendChild(selectedText);
					}
					var originalBis = upTree[0][0].cloneNode(false);
					originalBis.appendChild(lastText);
					selectedText.parentNode.insertBefore(originalBis, selectedText.nextSibling);
					
					for (var i = 0; i < anchorSiblings.length; i++) {
						originalBis.appendChild(anchorSiblings[i]);
					}
				}
			} else {
				alert("Operation not supported");
				console.log(select.anchorNode);
				console.log(select.focusNode);
				console.log(select.anchorOffset);
				console.log(select.focusOffset);
			}
		} else {
			if (select.anchorNode == select.focusNode) {
				if (select.anchorOffset < select.focusOffset) {
					start = select.anchorOffset;
					end = select.focusOffset;
				} else {
					start = select.focusOffset;
					end = select.anchorOffset;
				}
			
				first = select.anchorNode.data.substr(0, start);
				styled = select.anchorNode.data.substr(start, end - start);
				last = select.anchorNode.data.substr(end);
				
				firstText = document.createTextNode(first);
				styledNode = document.createElement(tag);
				styledNode.innerHTML = styled;
				lastText = document.createTextNode(last);
				
				select.anchorNode.parentNode.replaceChild(lastText, select.anchorNode);
				lastText.parentNode.insertBefore(styledNode, lastText);
				styledNode.parentNode.insertBefore(firstText, styledNode);
				
				if (first.length == 0) {
					// First was empty, remove the node
					styledNode.parentNode.removeChild(firstText);
				}
				if (last.length == 0) {
					styledNode.parentNode.removeChild(lastText);
				}
			} else {
				alert('Operation not yet supported...');
			}
		}
	}
	
	function hasTag(anchor, tag) {
		cur = anchor;
		while (cur.nodeName.toLowerCase() != 'div') {
			cur = cur.parentNode;
			
			if (cur.nodeName.toLowerCase() == tag) {
				return true;
			}
		}
		return false;
	}
}
