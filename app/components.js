app.components = {
	vote: {
		new: function($container, item_id, item_name, element, component_item) {
			var self = this;
			/*this.$container = null;
			this.item_id = null;
			this.item_name = null;
			this.element = null;*/
			function vote_object($container, item_id, item_name, element) {
				this.$container = $container;
				this.item_id = item_id;
				this.item_name = item_name;
				this.element = element;
				this.component_item = component_item;
			}
			vote_object.prototype = self;
			return new vote_object($container, item_id, item_name, element);
		},
		init: function() {
			var branch = this;
			branch.get_votes();
			branch.$container.find('.vote_button').click(function() {
				$.post(branch.root.actions, {
					'action': branch.item_name+'_vote',
					'id': branch.item_id
				}, function(data) {
					branch.get_votes();
				});
			});
		},
		get_votes: function() {
			var branch = this;
			$.post(branch.root.actions, {
				'action': branch.item_name+'_votes',
				'id': branch.item_id
			}, function(data) {
				branch.$container.find('.vote_count').html(data.votes);
				if(data.voted == 1) {
					branch.$container.addClass('voted');	
				}
			}, "json");
		}
	},
	tags: {
		new: function($container, item_id, item_name, element, component_item, page) {
			var self = this;
			function tags_object($container, item_id, item_name, element) {
				this.$container = $container;
				this.item_id = item_id;
				this.item_name = item_name;
				this.element = element;
				this.component_item = component_item;
				this.page = page;
			}
			tags_object.prototype = self;
			//tags_object.root_branch = this;
			return new tags_object($container, item_id, item_name, element);
		},
		init: function() {
			var $tags_container = this.$container;//this.$container.find('.tags').first();
			//alert($tags_container.html());
			var split = $tags_container.text().split(',');
			$tags_container.html("");

			for(var x in split) {
				var href;
				var tag = split[x].trim();
				var post_data = {
					'tag': tag
				};
				if(this.component_item.target == 'self') {
					href = this.root.navigation.generate_href(this.page.id, null, null, post_data, this.page.frame_id);
				}
				$tags_container.append("<a href='"+href+"'>"+tag+"</a>, ");
			}
		}
	}
};