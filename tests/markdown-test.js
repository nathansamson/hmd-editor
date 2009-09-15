module("markdown");

function getTextArea() {
	return document.getElementById('hybrid-textarea');
}

test ("Markdown initial content to tree", function() {
	var markdown = new Markdown(getTextArea(), null);
	
	expectedTree = ['markdown', ['bold', 'dit is vet en ', ['italic', 'italic']]];
	actualTree = markdown.getTree();
	same(actualTree, expectedTree, "Initial tree does not match.");
})

test ("Markdown updated content to tree", function() {
	var markdown = new Markdown(getTextArea(), null);
	getTextArea().value = "*dit is vet en, ***dit is italic.**";
	
	expectedTree = ['markdown', ['bold', 'dit is vet en, '], ['italic', 'dit is italic.']];
	actualTree = markdown.getTree();
	same(actualTree, expectedTree, "Initial tree does not match.");
})

test ("Markdown tree to text", function() {
	var textarea = getTextArea();
	var wysiwyg = new Wysiwyg(textarea);
	var markdown = new Markdown(textarea, wysiwyg.getWidget());
	wysiwyg.show(['markdown']);
	
	var tree = ['markdown', 'This is some text. ', ['bold', 'This is bold and ', ['italic', 'italic'], '.']];
	markdown.show(tree);
	
	equals(textarea.value, "This is some text. *This is bold and **italic**.*");
})
