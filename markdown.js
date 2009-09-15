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
