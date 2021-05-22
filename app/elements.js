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
	grids: Array(),
	calendars: Array(),
	find_element_object: function(callback_item_reference) {
		var branch = this;
		var callback_item = callback_item_reference;
		var split = callback_item.split("_");
		var type = split[split.length-1]+"s";
		var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
		eval(statement);	
		return element;
	},
	elements_store: null,
	store_elements: function() {
		this.elements_store = {
			tables: this.tables,
			forms: this.forms,
			lists: this.lists,
			grids: this.grids,
			calendars: this.calendars
		};
		console.log(this.elements_store);
		this.tables = Array();
		this.forms = Array();
		this.lists = Array();
		this.grids = Array();
		this.calendars = Array();
		
		/*for(var x in this.tables) {
			this.elements_store.tables[x] = this.tables[x];
		}
		for(var x in this.forms) {
			this.elements_store.forms[x] = this.forms[x];
		}
		for(var x in this.lists) {
			this.elements_store.lists[x] = this.lists[x];
		}
		for(var x in this.grids) {
			this.elements_store.grids[x] = this.grids[x];
		}
		for(var x in this.calendars) {
			this.elements_store.calendars[x] = this.calendars[x];
		}*/
	},
	restore_elements: function() {
		if(this.elements_store != null) {
			this.tables = this.elements_store.tables;
			this.forms = this.elements_store.forms;
			this.lists = this.elements_store.lists;
			this.grids = this.elements_store.grids;
			this.calendars = this.elements_store.calendars;
		}
		this.elements_store = null;
	},
	search_elements: Array()
};