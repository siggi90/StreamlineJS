app.update = {
	init: function(data) {
		var branch = this;
		var $function_button = $('.updates_container');
		$function_button.find('.button').first().click(function() {
			$(this).hide();
			var $this = $(this);
			$function_button.find('.loading_spinner').show();
			$.post("https://www.noob.software/cloud_api/actions.php", {
				'action': "get_updates"
			}, function(data) {
				$.post(branch.root.actions, {
					"action": "recieve_updates_",
					'updates': data	
				}, function(data) {
					setTimeout(function() {							
						$function_button.find('.loading_spinner').hide();
						$this.show();
					}, 1000);
				});
			});
		});
		
	}
};