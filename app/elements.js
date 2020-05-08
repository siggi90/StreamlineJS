app.elements = {
	menus: Array(),
	frames: {
		body: {
			level: 0	
		},
		search_results: {
			level: 0	
		}
	},
	tables: Array(),
	forms: Array(),
	lists: Array(),
	find_element_object: function(callback_item_reference) {
		var branch = this;
		var callback_item = callback_item_reference;
		var split = callback_item.split("_");
		var type = split[split.length-1]+"s";
		var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
		eval(statement);	
		return element;
	},
	search_elements: Array()
};