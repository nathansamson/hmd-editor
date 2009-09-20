function wysiwygSetup() {
	this.textarea = getTextArea();
	this.wysiwyg = new Wysiwyg(this.textarea);
	this.markdown = new Markdown(this.textarea, this.wysiwyg.getWidget());
	this.wysiwyg.show(['markdown', 'This is some text. ', ['bold', 'This is bold and ', ['italic', 'italic'], '.']]);
}

function wysiwygTeardown() {
	if (this.hide != false) {
		this.markdown.show(['markdown']);
	}
}

module("Wysiwyg test", {'setup': wysiwygSetup, 'teardown': wysiwygTeardown });

function checkDOM(dom, domDesc) {
	if (domDesc == null) {
		ok(false, "Unexpected end of domDesc");
		return false;
	}
	for (var i = 0; i < dom.length; i++) {
		if (i >= domDesc.length) {
			equals(dom[i].nodeName, "");
			return false;
		}
		if (dom[i].nodeName == '#text') {
			if (dom[i].data != domDesc[i]) {
				equals(dom[i].data, domDesc[i]);
				return false;
			}
		} else {
			if (dom[i].nodeName.toLowerCase() != domDesc[i][0]) {
				equals(dom[i].nodeName.toLowerCase(), domDesc[i][0]);
				return false;
			}
			if (! checkDOM(dom[i].childNodes, domDesc[i][1])) {
				return false;
			}
		}
	}
	return true;
}

test ("Apply tree test", function() {	
	expectedDOM = ['This is some text. ', ['strong', ['This is bold and ', ['em', ['italic']], '.']]];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test", function() {
	// Select the word "bold", and make it italic.
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild, 8);
	range.setEnd(range.startContainer, 12)
	selection.addRange(range);
	this.wysiwyg.italic();
	
	expectedDOM = ['This is some text. ', ['strong', ['This is ', ['em', ['bold']], ' and ', ['em', ['italic']], '.']]];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in 2 block levels", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph ', ['bold', 'with some ', ['italic', 'important'], ' text'], '.']
	                  ]);
	
	// Select The (in the first p) to "text" (in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling.nextSibling, 5);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is the second paragraph with some ', ['em', ['important']], ' text']], '.']]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in 2 block levels could split but has style", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph ', ['bold', 'with some ', ['italic', 'important'], ' text'], '.']
	                  ]);
	
	// Select The (in the first p) to " te" (but without "xt")(in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling.nextSibling, 3);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is the second paragraph with some ', ['em', ['important']], ' text']], '.']]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in 2 block levels split last text node", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph ', ['italic', 'with some ', ['bold', 'important'], ' text'], '.']
	                  ]);
	
	// Select The (in the first p) to " te" (but without "xt")(in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling.nextSibling, 3);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is the second paragraph ', ['em', ['with some important te']]]], ['em', ['xt']], '.']]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Remove markup test", function() {	
	// Select the word "bold", and remove the boldness.
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild, 8);
	range.setEnd(range.startContainer, 12)
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = ['This is some text. ', ['strong', ['This is ']], 'bold', ['strong', [' and ', ['em', ['italic']], '.']]];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Remove markup test 2", function() {
	this.markdown.show(['markdown']);
	this.wysiwyg.show(['markdown', 'This is some text. ', ['bold', 'This is ', ['italic', 'bold'], ' and ', ['italic', 'italic'], '.']]);	
	// Select the word "ol" (in the word bold), and remove the boldness.
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild.nextSibling.firstChild, 1);
	range.setEnd(range.startContainer, 3)
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = ['This is some text. ',
				   ['strong', ['This is ', ['em', 'b']]], 
				   ['em', ['ol', ['strong', 'd']]], 
				   ['strong', [' and ', ['em', ['italic']], '.']]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Paragraph test", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 'This is some text. ', ['paragraph', 'First paragraph.', ['bold', 'With bold text.']]]);
	
	expectedDOM = ['This is some text. ',
	               ['p', ['First paragraph.', 
	                      ['strong', ['With bold text.']]
	                     ]
	               ]
	              ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

