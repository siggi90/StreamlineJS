app.developer = {
	init: function($container, page) {
		var branch = this;
		var $developer_overlay = $('.developer_overlay');
		$container.find('.form').each(function() {
			$(this).append('<i class="icofont-plus-circle _developer_add_button"></i>');
			$(this).find('._developer_add_button').click(function() {
				$('.body_container').addClass('blur');
				$developer_overlay.css({
					'display': 'unset',
					'opacity': 0
				}).animate({
					'opacity': 1
				}, 1250, 'easeInOutQuad', function() {
					$developer_overlay.find('.add_form_element').fadeIn('fast');	
				});
			});
		});
		$container.append("<div class='form'><div class='form_element'><textarea class='form_input page_definition'></textarea></div><div class='height_auto'><button id='_developer_save_button' style='float:right'>Save</button></div></div>");
		$container.find('#_developer_save_button').click(function() {
			$.post(branch.root.actions, {
				'action': '_page_extension',
				'module': 'developer',
				'page': page.id,
				'extension': JSON.stringify($container.find('.page_definition').first().val())
			}, function(data) {
				
			});
		});
		var $page_definition = $container.find('.page_definition');
		$page_definition.val(JSON.stringify(page, null, 4));
		$.post(branch.root.actions, {
			'action': 'get_page_extension',
			'module': 'developer',
			'page': page.id
		}, function(data) {
			if(data != null) {
				var extension = JSON.parse(data.extension);
				
				$page_definition.val(extension);
			}
		}, "json");
		/*$('._developer_add_button').eaach(function() {
			
		});*/
	}
};