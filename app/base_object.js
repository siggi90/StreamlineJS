app.base_object = {
	list: Array(),
	initialized: false,
	loaded_function: null,
	loaded: function(loaded_function) {
		this.loaded_function = loaded_function;
	},
	new: function() {
		var self = this;
		function base_object() {
			self.root.functions.copy_object(this, self);
		}
		return new base_object();
	},
	base_init: function(parameters) {
		for(var x in parameters) {
			if(typeof parameters[x] !== 'undefined' && parameters[x] !== null) {
				var command = "this."+x+" = parameters["+x+"];";
				eval(command);
			}	
		}
	},
	post_init_state: Array(),
	load_post_init_state: function() {
		var self = this;
		for(var x in this.post_init_state) {
			//var prop_statement = 'var property = self.'+row.property.substr(this_path.length)+';';
			var prop_statement = 'var property = self.root.'+row.property+';';
			eval(prop_statement);
			if(typeof property !== 'undefined') {
				//var statement = 'self.'+row.property.substr(this_path.length)+" = "+row.value+";";
				var statement = 'self.root.'+row.property+" = "+row.value+";";
				eval(statement);
			} else {
				var init_parent = self.root.functions.find_init_parent(row.property, this.init_parent_level);
				if(typeof init_parent.post_init_state === 'undefined') {
					init_parent.post_init_state = Array();	
				}
				//var statement = 'this.root.'+row.property+" = "+row.value+";";
				init_parent.post_init_state.push(row);	
				init_parent.init_parent_level = this.init_parent_level + 1;
			}
		}
	},
	load_parameters: {
		action: ''
		//id: ''
	},
	/*
		Nota þetta sem almennt fall sem tekur við callbacki sem inniheldur sérhæfða virkni
	*/
	load_list: function() {
		var self = this;
		if(typeof self.post_data !== 'undefined') {
			for(var x in self.post_data) {
				var command = "this.load_parameters."+x+" = self.post_data[x];"
				eval(command);	
			}
		}
		/*if(typeof this.id !== 'undefined') {
			this.load_parameters.id = this.id;	
		}*/
		$.post(this.root.responder, this.load_paramaters, function(data) {
			self.update_view(data);
			if(self.loaded_callback != null) { //loaded_function
				if(typeof self.value_property !== 'undefined') {
					self.loaded_callback(self.value_property);	
				} else {
					self.loaded_callback('value');	
				}
			}
			if(!self.initialized) {
				self.finish_init();	
			}
			self.app_state.assign_watch(self);	
		}, "json");
	},
	finish_init: function() {
		var self = this;
		self.load_post_init_state();
		this.initialized = true;
	},
	update_view: function() {
		
	},
	by_id: function(id) {
		for(x in this.list) {
			if(this.list[x].li_id == id) {
				return this.list[x];	
			}
		}
	}
};