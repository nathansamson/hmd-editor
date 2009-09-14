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
		return buildTree(widget.childNodes);
	}
	
	this.getWidget = function () {
		return widget;
	}

	/* Private functions */

	function applyTree(tree, node) {
		for (var i = 0; i < tree.length; i++) {
			if (tree[i][0] == 'bold') {
				var el = document.createElement('strong');
			} else if (tree[i][0] == 'italic') {
				var el = document.createElement('em');
			} else {
				console.log("Internal error");
			}
			for (var j = 1; j < tree[i].length; j++) {
				if (typeof(tree[i][j]) == "string") {
					el.innerHTML = tree[i][j];
				} else {
					applyTree([tree[i][j]], el);
				}
			}
			
			node.appendChild(el);
		}
	}
	
	function buildTree (nodes) {
		var tree = [];
		for (i = 0; i < nodes.length; i++) {
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
				otherPNodes = [];
				// Go up the tree until we find the needed tag
				// Meanwhile store all nodes in otherNodes
				cur = select.anchorNode.parentNode;
				while (cur.tagName.toLowerCase() != tag  && cur.tagName.toLowerCase() != 'div') {
					otherPNodes.push(cur);
					cur = cur.parentNode;
				}
				otherSiblingNodes = [];
				nextS = select.anchorNode.nextSibling;
				while (nextS != null) {
					console.log("SIBLING");
					otherSiblingNodes.push(nextS);
					nextS = nextS.nextSibling;
				}
				
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
				
				// anchorNode is a textNode with:
				// text /selected text/ more text + more markup
				// We have to close all otherNodes + cur before selected text
				// We have to open all otherNodes before /selected text/
				// We have to open cur before more text.
				select.anchorNode.parentNode.replaceChild(firstText, select.anchorNode);
				if (otherPNodes.length == 0) {
					var selectedTag = selectedText;
				} else {
					var selectedTag = null;
					var lastTag = null;
					for (i = 0; i < otherPNodes.length; i++) {
						var newTag = document.createElement(otherPNodes[i].nodeName);
						if (i > 0) {
							lastTag.appendChild(newTag);
							lastTag = newTag;
						} else {
							lastTag = newTag;
							selectedTag = newTag;
						}
					}
					selectedTag.appendChild(selectedText);
				}
				cur.parentNode.insertBefore(selectedTag, cur.nextSibling);
				openTag = document.createElement(tag);
				openTag.appendChild(lastText);
				if (newTag) {
					newTag.appendChild(openTag);
				} else {
					cur.parentNode.appendChild(openTag);
				}
				for (i = 0; i < otherSiblingNodes.length; i++) {
					sibling = otherSiblingNodes[i];
					sibling.parentNode.removeChild(sibling);
					openTag.appendChild(sibling);
				}
				
				if (firstText.length == 0) {
					// Just delete cur
					cur.parentNode.removeChild(cur);
				}
				if (lastText.length == 0) {
					lastText.parentNode.removeChild(lastText);
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
