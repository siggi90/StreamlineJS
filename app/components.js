app.components = {
	vote: {
		new: function($container, item_id, item_name, element) {
			var self = this;
			function vote_object($container, item_id, item_name, element) {
				this.$container = $container;
				this.item_id = item_id;
				this.item_name = item_name;
				this.element = element;
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
	}
};