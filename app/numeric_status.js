app.custom_elements.numeric_status = {
	init: function(content_item, $container, $page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;

		$container.append("<div class='numeric_status' id='"+content_item.id+"_numeric_status'></div>");
		branch.$numeric_status_container = $container.find('#'+content_item.id+'_numeric_status').first();
		/*var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.load();
		
		*/

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		var numeric_status_object = {
			id: content_item.id,
			printed: false,
			$element: branch.$numeric_status_container,
			operation: {
				load: function() {
					var self = this;
					$.post(branch.root.actions, {
						'action': branch.content_item.id+'_numeric_status'
					}, function(data) {
						//branch.$tree_content.html("");
						//branch.print_tree_item(data, 20, branch.$tree_content);
						if(!self.printed) {
							branch.print_status(data);
							self.printed = true;
						} else {
							branch.update_view(data);
						}
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				}
			}
		};
		if(typeof branch.root.elements.numeric_statuss === 'undefined') {
			branch.root.elements.numeric_statuss = Array();	
		}
		branch.load();
		
		branch.root.elements.numeric_statuss[content_item.id+"_numeric_status"] = numeric_status_object;
	},
	load: function() {
		var branch = this;
		$.post(branch.root.actions, {
			'action': branch.content_item.id+'_numeric_status'
		}, function(data) {
			branch.print_status(data);
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		}, "json");
	},
	print_status: function(data) {
		var branch = this;
		for(var x in data) {
			var label = branch.content_item.labels[x];
			branch.$numeric_status_container.append("<div class='numeric_status_item' id='"+x+"_numeric_status_item'><div class='header'>"+label+"</div><div class='numeric_status_value'>"+data[x]+"</div></div>");
			branch['$'+x] = branch.$numeric_status_container.find('#'+x+'_numeric_status_item').first();
		}
	},
	update_view: function(data) {
		var branch = this;
		for(var x in data) {
			var $item = branch['$'+x];
			$item.find('.numeric_value_status').html(data[x]);
		}
	}
};