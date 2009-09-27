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
		} else if (tree[0] == 'paragraph') {
			el = document.createElement('p');
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
			} else if (node.nodeName.toLowerCase() == 'p') {
				subTree = ['paragraph'];
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
					var original = upTree[0][0];
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
				firstBlock = findFirstBlockLevel(select.anchorNode);
				secondBlock = findFirstBlockLevel(select.focusNode);
				// Some browsers, touch the selection.
				// So we copy the nodes before working on them so we
				// are not affected when the selection disappears.
				var anchorOffset = select.anchorOffset;
				var anchorNode = select.anchorNode;
				var focusNode = select.focusNode;
				var focusOffset = select.focusOffset;
				if (firstBlock == secondBlock) {
					applyStyleToBlockLevel(firstBlock, tag,
					                       anchorNode, anchorOffset,
					                       focusNode, focusOffset);
				} else {
					var currentBlock = firstBlock.nextSibling;
					if (secondBlock.compareDocumentPosition(firstBlock) & Node.DOCUMENT_POSITION_CONTAINS) {
						currentBlock = anchorNode;
						while (currentBlock.parentNode != firstBlock) {
							currentBlock = currentBlock.parentNode;
						}
					} else {
						applyStyleToBlockLevel(firstBlock, tag, anchorNode,
						                       anchorOffset, null, 0);
					}
					var simpleNodes = [];
					while (currentBlock != secondBlock && currentBlock != null) {
						if (isBlockTag(currentBlock)) {
							if (simpleNodes.length != 0) {
								var lastTextNode = findLastTextNode(simpleNodes[simpleNodes.length-1]);
								var firstTextNode = findFirstTextNode(simpleNodes[0]);
								var start = 0;
								if (firstTextNode == anchorNode && anchorOffset != 0) {
									start = anchorOffset;
								}
								applyStyleToBlockLevel(currentBlock.parentNode, tag,
								                       firstTextNode, start,
								                       lastTextNode, lastTextNode.data.length);
								simpleNodes = [];
							}
							applyStyleToBlockLevel(currentBlock, tag);
						} else {
							simpleNodes.push(currentBlock);
						}
						currentBlock = currentBlock.nextSibling;
					}
					if (simpleNodes.length != 0) {
						var lastTextNode = findLastTextNode(simpleNodes[simpleNodes.length-1]);
						var firstTextNode = findFirstTextNode(simpleNodes[0]);
						applyStyleToBlockLevel(secondBlock, tag,
						                       firstTextNode, 0,
						                       lastTextNode, focusOffset);
						simpleNodes = [];
					} else {
						applyStyleToBlockLevel(secondBlock, tag, null, 0,
						                       focusNode, focusOffset);
					}
				}
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
	
	function findFirstBlockLevel(node) {
		if (isBlockTag(node)) {
			return node;
		} else {
			return findFirstBlockLevel(node.parentNode);
		}
	}
	
	function isBlockTag(node) {
		var nodeName = node.nodeName.toLowerCase();
		return (nodeName == 'p' || nodeName == 'div');
	}
	
	function applyStyleToBlockLevel(block, style,
	                                startNode, startOffset,
	                                endNode, endOffset) {
		var styleNode = document.createElement(style);
		var sibling;
		if (startNode != null) {
			if (startOffset != 0) {
				sibling = startNode;
			} else {
				sibling = startNode;
			}
			var appliedStyles = [];
			while (sibling.parentNode != block) {
				sibling = sibling.parentNode;
				appliedStyles.push(sibling);
			}
			if (startOffset != 0) {
				var outNode = createTextNode(appliedStyles, startNode.data.substr(0, startOffset));
				startNode.data = startNode.data.substr(startOffset);
				sibling.parentNode.insertBefore(outNode, sibling);
			}
		} else {
			sibling = block.firstChild;
		}
		var siblings = [];
		if (sibling == endNode) {
			if (endOffset >= endNode.length) {
				// We have to 
				var nextSibling = sibling.nextSibling;
				siblings.push(sibling);
				styleNode.appendChild(sibling);
				sibling = nextSibling;
			} else {
				// This can not have any applied styles, because endNode would not be sibling.
				var nextSibling = createTextNode([], sibling.data.substr(endOffset));
				sibling.data = sibling.data.substr(0, endOffset);
				siblings.push(sibling);
				sibling.parentNode.insertBefore(nextSibling, sibling.nextSibling);
				styleNode.appendChild(sibling);
				sibling = nextSibling;
			}
		} else {
			while (sibling != endNode) {
				if (sibling != null && endNode != null) {
					contains = endNode.compareDocumentPosition(sibling) & Node.DOCUMENT_POSITION_CONTAINS;
					if (contains) {
						// is end Node the last node of sibling?
						var cur = endNode;
						var appliedStyles = [];
						isEndNodeLastOf = true;
						while (cur != sibling) {
							if (cur.nextSibling != null) {
								isEndNodeLastOf = false;
							}
							cur = cur.parentNode;
							appliedStyles.push(cur);
						}
						if ((endOffset >= endNode.length || hasTag(endNode, style)) && isEndNodeLastOf) {
							// Easy situation, just pull sibling into styleNode
							siblings.push(sibling);
							var nextSibling = sibling.nextSibling;
							styleNode.appendChild(sibling);
							sibling = nextSibling;
						} else if (endOffset < endNode.length && isEndNodeLastOf) {
							// endNode has not the current style, so we split it up.
							var inNode = document.createTextNode(endNode.data.substr(0, endOffset));
							var outNode = createTextNode(appliedStyles, endNode.data.substr(endOffset));
							siblings.push(sibling);
							var nextSibling = sibling.nextSibling;
							var parentNode = sibling.parentNode;
							styleNode.appendChild(sibling);
							sibling = nextSibling;
							endNode.parentNode.replaceChild(inNode, endNode);							
							parentNode.insertBefore(outNode, sibling);
							sibling = outNode;
						} else {
							if (hasTag(endNode, style)) {
								siblings.push(sibling);
								// We do not have to split up endNode
								var original = endNode.parentNode.parentNode;
								var curSibling = endNode.parentNode.nextSibling;
								while (original != sibling.parentNode) {
									var copy = original.cloneNode(false);
									while (curSibling != null) {
										var curNextSibling = curSibling.nextSibling;
										copy.appendChild(curSibling);
										curSibling = curNextSibling;
									}
									curSibling = original.nextSibling;
									original = original.parentNode;
								}
								sibling.parentNode.insertBefore(copy, sibling.nextSibling);
								styleNode.appendChild(sibling);
								sibling = copy;
								//sibling = sibling.nextSibling;
							}
						}
						break;
					}
				}
				siblings.push(sibling);
				var nextSibling = sibling.nextSibling;
				styleNode.appendChild(sibling);
				sibling = nextSibling;
			}
			if (sibling != null && sibling == endNode) {
				if (sibling.data.length > endOffset) {
					var nextSibling = createTextNode([], sibling.data.substr(endOffset));
					sibling.data = sibling.data.substr(0, endOffset);
					siblings.push(sibling);
					sibling.parentNode.insertBefore(nextSibling, sibling.nextSibling);
					styleNode.appendChild(sibling);
					sibling = nextSibling;
				} else {
					var nextSibling = sibling.nextSibling;
					siblings.push(sibling);
					styleNode.appendChild(sibling);
					sibling = nextSibling;
				}
			}
		}
		for (var i = 0; i < siblings.length; i++) {
			removeStyle(siblings[i], style);
		}
		block.insertBefore(styleNode, sibling);
	}
	
	function removeStyle(node, style) {
		if (node.nodeName.toLowerCase() == style) {
			var prevSibling = node.previousSibling;
			var nextSibling = node.nextSibling;
			var first = node.firstChild;
			var last = node.lastChild;
			var start, end;
			if (prevSibling != null && first.nodeName == prevSibling.nodeName) {
				mergeNode(prevSibling, first);
				start = 1;
			} else {
				start = 0;
			}
			if (nextSibling != null && last.nodeName == nextSibling.nodeName && first != last) {
				end = 1;
				mergeNode(nextSibling, last);
			} else if (nextSibling != null && last.nodeName == nextSibling.nodeName) {
				// First is last
				// Also merge prevSibling with nextSibling
				mergeNode(prevSibling, nextSibling);
				nextSibling.parentNode.removeChild(nextSibling);
				end = 1;
			} else {
				end = 0;
			}
			var childNodes = slice(node.childNodes, start, end);
			for (var i = 0; i < childNodes.length; i++) {
				node.parentNode.insertBefore(childNodes[i], nextSibling);
			}
			node.parentNode.removeChild(node);
			return true;
		} else {
			if (node.hasChildNodes()) {
				var childNodes = slice(node.childNodes);
				for (var i = 0; i < childNodes.length; i++) {
					removeStyle(childNodes[i], style);
				}
			}
		}
	}
	
	function mergeNode(node, merge) {
		if (node.nodeName != "#text") {
			for (var i = 0; i < merge.childNodes.length; i++) {
				var child = merge.childNodes[i];
				node.appendChild(child);
			}
		} else {
			node.data += merge.data;
		}
	}
	
	function createTextNode(appliedStyles, text) {
		var node, lastChild;
		lastChild = document.createTextNode(text);
		for (var i = appliedStyles.length - 1; i >= 0; i--) {	
			node = appliedStyles[i].cloneNode(false);
			node.appendChild(lastChild);
			lastChild = node;
		}
		return lastChild;
	}
	
	function findFirstTextNode(node) {
		if (node.nodeName != '#text') {
			return findFirstTextNode(node.firstChild);
		} else {
			return node;
		}
	}
	
	function findLastTextNode(node) {
		if (node.nodeName != '#text') {
			return findLastTextNode(node.lastChild);
		} else {
			return node;
		}
	}
}

function slice(nodes, start, end) {
	var ret = [];
	if (start == null) {
		start = 0;
		end = 0;
	} else if (end == null) {
		end = 0;
	}
	for (var i = start; i < nodes.length - end; i++) {
		ret.push(nodes[i]);
	}
	return ret;
}
