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

test ("Apply markup test in 2 block levels split last text node", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph ', ['italic', 'with some ', ['bold', 'important'], ' text ', ['bold', 'and other markup']], '.']
	                  ]);
	
	// Select The (in the first p) to "important" (in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild.nextSibling.firstChild.nextSibling.firstChild, 3);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is the second paragraph ', ['em', ['with some important']]]], ['em', [' text ', ['strong', ['and other markup']]]], '.']]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in 2 blocks last block has only one textnode", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph.']
	                  ]);

	// Select The 2 paragraphs completely
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild, 29);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is the second paragraph.']]]]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in 2 blocks last block split first node", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph.', ['italic', ' And more italic text.']]
	                  ]);

	// Select The (in the first p) to "This is" (in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.nextSibling.firstChild, 7);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['This is']], ' the second paragraph.', ['em', [' And more italic text.']]]]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in multiple blocks", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'Another paragraph.'],
	                   ['paragraph', '3th paragraph.', ['bold', ' With bold text.'], ['italic', ' Italic text.', ['bold', ' And bold text.']]],
	                   'Some simple text.',
	                   ['italic', ' Some simple italic text.'],
	                   ['bold', ' Some simple bold text.'],
	                   ['italic', ['bold', ' With some more text.']],
	                   ['paragraph', '4th paragragph.', ['bold', ' With bold text.'], ['italic', ' Italic text.']],
	                   ['paragraph', 'This is the second paragraph.', ['italic', ' And more italic text.']]
	                  ]);

	// Select The (in the first p) to "text." (in the last p).
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().lastChild.lastChild.firstChild, 22);
	selection.addRange(range);
	this.wysiwyg.bold();
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['Another paragraph.']]]],
				   ['p', [['strong', ['3th paragraph. With bold text.', ['em', [' Italic text. And bold text.']]]]]],
				   ['strong', ['Some simple text.', ['em', [' Some simple italic text.']], ' Some simple bold text.', ['em', [' With some more text.']]]],
				   ['p', [['strong', ['4th paragragph. With bold text.', ['em', [' Italic text.']]]]]],
	               ['p', [['strong', ['This is the second paragraph.', ['em', [' And more italic text.']]]]]]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in one block", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'This is the second paragraph.', ['italic', ' And more italic text.']]
	                  ]);
	
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.lastChild, 6);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', ['This is the second paragraph.', ['em', [' And more italic text.']]]]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test in one block split last text node", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' more text.'],
	                   ['paragraph', 'This is the second paragraph.', ['italic', ' And more italic text.']]
	                  ]);
	
	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().firstChild.lastChild, 5);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' more']], ' text.']],
				   ['p', ['This is the second paragraph.', ['em', [' And more italic text.']]]]
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test multiple blocks last is no block tag group", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'Another paragraph.'],
	                   ['paragraph', '3th paragraph.', ['bold', ' With bold text.'], ['italic', ' Italic text.', ['bold', ' And bold text.']]],
	                   'Some simple text.',
	                   ['italic', ' Some simple italic text.'],
	                   ['bold', ' Some simple bold text.'],
	                   ['italic', ['bold', ' With some more text.']],
	                  ]);

	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().lastChild.firstChild.firstChild, 21);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['Another paragraph.']]]],
				   ['p', [['strong', ['3th paragraph. With bold text.', ['em', [' Italic text. And bold text.']]]]]],
				   ['strong', ['Some simple text.', ['em', [' Some simple italic text.']], ' Some simple bold text.', ['em', [' With some more text.']]]],
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test multiple blocks last is no block tag group not complete but has style", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'Another paragraph.'],
	                   ['paragraph', '3th paragraph.', ['bold', ' With bold text.'], ['italic', ' Italic text.', ['bold', ' And bold text.']]],
	                   'Some simple text.',
	                   ['italic', ' Some simple italic text.'],
	                   ['bold', ' Some simple bold text.'],
	                   ['italic', ['bold', ' With some more text.']],
	                  ]);

	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().lastChild.firstChild.firstChild, 5);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['Another paragraph.']]]],
				   ['p', [['strong', ['3th paragraph. With bold text.', ['em', [' Italic text. And bold text.']]]]]],
				   ['strong', ['Some simple text.', ['em', [' Some simple italic text.']], ' Some simple bold text.', ['em', [' With some more text.']]]],
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test multiple blocks last is no block tag group not complete but has not style", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'Another paragraph.'],
	                   ['paragraph', '3th paragraph.', ['bold', ' With bold text.'], ['italic', ' Italic text.', ['bold', ' And bold text.']]],
	                   'Some simple text.',
	                   ['italic', ' Some simple italic text.'],
	                   ['bold', ' Some simple bold text.'],
	                   ['italic', ' With some more text.'],
	                  ]);

	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 0);
	range.setEnd(this.wysiwyg.getWidget().lastChild.firstChild, 5);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	expectedDOM = [['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['Another paragraph.']]]],
				   ['p', [['strong', ['3th paragraph. With bold text.', ['em', [' Italic text. And bold text.']]]]]],
				   ['strong', ['Some simple text.', ['em', [' Some simple italic text.']], ' Some simple bold text.', ['em', [' With']]]],
				   ['em', [' some more text.']],
				  ];
	ok(checkDOM(this.wysiwyg.getWidget().childNodes, expectedDOM), "DOM does not match");
})

test ("Apply markup test multiple blocks first is no block tag", function() {
	this.markdown.show(['markdown'])
	this.wysiwyg.show(['markdown', 
		               ['italic', 'Some simple italic text.'],
	                   ' Some simple text.',
	                   ['bold', ' Some simple bold text.'],
	                   ['italic', ' With some more text.'],
	                   ['paragraph', 'The ', ['bold', 'first paragraph'], ' with some ', ['italic', 'emphasized'], ' text.'],
	                   ['paragraph', 'Another paragraph.'],
	                   ['paragraph', '3th paragraph.', ['bold', ' With bold text.'], ['italic', ' Italic text.', ['bold', ' And bold text.']]],
	                  ]);

	var selection = window.getSelection();
	var range = document.createRange();
	range.setStart(this.wysiwyg.getWidget().firstChild.firstChild, 5);
	range.setEnd(this.wysiwyg.getWidget().lastChild.firstChild, 3);
	selection.addRange(range);
	this.wysiwyg.bold();
	
	this.hide = false;
	expectedDOM = [['em', ['Some ']],
	               ['strong', [['em', ['simple italic text.']], ' Some simple text. Some simple bold text.', ['em', [' With some more text.']]]],
	               ['p', [['strong', ['The first paragraph with some ', ['em', ['emphasized']], ' text.']]]],
				   ['p', [['strong', ['Another paragraph.']]]],
				   ['p', [['strong', ['3th']],' paragraph.', 
				          ['strong', [' With bold text.']], 
				          ['em', [' Italic text.', ['strong',[' And bold text.']]]]]],
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

