app.custom_elements.tree = {
	init: function(content_item, $container, $page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;
		var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;
		branch.load();
		
		var tree_object = {
			id: content_item.id,
			$element: $tree,
			operation: {
				load: function() {
					$.post(branch.root.actions, {
						'action': branch.content_item.id+'_tree'
					}, function(data) {
						branch.$tree_content.html("");
						branch.print_tree_item(data, 20, branch.$tree_content);
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				}
			}
		};
		if(typeof branch.root.elements.trees === 'undefined') {
			branch.root.elements.trees = Array();	
		}
		branch.root.elements.trees[content_item.id+"_tree"] = tree_object;
		
	},
	load: function() {
		var branch = this;
		$.post(branch.root.actions, {
			'action': branch.content_item.id+'_tree'
		}, function(data) {
			branch.$tree_content.html("");
			branch.print_tree_item(data, 20, branch.$tree_content);
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		}, "json");
	},
	print_tree_item: function(data, padding, $container) {
		var branch = this;
		for(var x in data) {
			(function(x) {
				$container.append("<div style='padding-left:"+padding+"px' class='node_wrap'><div id='"+data[x].id+"' class='node'><span>"+data[x].title+"</span><span class='controls'><i class='icofont-ui-edit edit_button'></i><i class='icofont-trash delete_button'></i></span></div><div class='children'></div></div>");
				var $node = $container.find('#'+data[x].id).first();
				var $edit = $node.find('.controls').find('.edit_button').first().click(function() {
					$.post(branch.root.actions, {
						'action': 'get_'+branch.content_item.id+'_node',
						'id': data[x].id
					}, function(data) {
						branch.form_object.operation.load(data);
					}, "json");
				});
				var $delete = $node.find('.controls').find('.delete_button').first().click(function() {
					branch.root.dialogs.delete_dialog.display("Are you sure you want to delete this tree node (and it's children)?", function() {
						$.post(branch.root.actions, {
							'action': 'delete_'+branch.content_item.id+'_node',
							'id': data[x].id
						}, function(data) {
							branch.load();
						});
					});
				});
				var $children = $container.find('#'+data[x].id).first().parent().find('.children').first();
				branch.print_tree_item(data[x].children, padding+20, $children);	
			}(x));
		}
	}
};