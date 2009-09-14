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
