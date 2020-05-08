app.search = {
	init: function() {
		var branch = this;
		$('.user_info #search_button').first().click(function() {
			branch.display_search();
		});
		if(typeof this.root.definition !== 'undefined' && typeof this.root.definition.search !== 'undefined' ) {
			$('.user_info #search_button').css('display', 'block');	
			this.traverse_definition();
		}
		var page_object = {
			'id': 'search',
			'title': 'Search',
			'content': this.search_content	
		};
		$('.close_position_search').click(function() {
			$('.search_container .search_input').val("");
			branch.hide_search();
		});
		if(typeof branch.root.definition.search !== 'undefined') {
			if(branch.root.definition.search.search_type == 'filter') {
				$('.search_container .search_input').first().keyup(function() {
					var value = $(this).val().trim();
					if(value != "") {
						$('#search_results_frame').find('.table_row').each(function() {
							if(!$(this).hasClass('table_header')) {
								if($(this).text().toLowerCase().indexOf(value.toLowerCase()) != -1) {
									$(this).show();	
								} else {
									$(this).hide();	
								}
							}
						});
					} else {
						$('#search_results_frame').find('.table_row').each(function() {
							if(!$(this).hasClass('table_header')) {
								$(this).show();			
							}
						});
					}
				});
			} else {
				$('.search_container .search_input').first().keyup(function() {
					for(var x in branch.root.elements.search_elements) {
						branch.root.elements.search_elements[x].operation.load(null, $(this).val());	
					}
				});
			}
		}
		
		var $frame = $('.search_container .search_results_frame').first();
		this.root.interpretation.render_page(page_object, undefined, $frame, function() {
			$('#search_results_frame').find('.table_row').click(function() {
				branch.hide_search();
				//$('.search_container .search_input').first().trigger('keyup');
			});	
		});
		
		
	},
	display_search: function() {
		/*if(typeof this.root.definition !== 'undefined') {
				
		}*/
		var branch = this;
		$('.search_container .search_input').first().trigger('keyup');
		$('.body_container').addClass('blur');
		$('.overlay_black').css({
			'opacity': 0,
			'display': 'block'
		}).animate({
			'opacity': 1
		}, 600, 'easeInOutQuad', function() {
			$('.search_container').css({
				'opacity': 0,
				'display': 'block'
			}).animate({
				'opacity': 1
			}, 450, 'easeInQuint');
		});
		/*$('.overlay_black').click(function(e) {
			if(e.target === this) {
				branch.hide_search();
			}
		});*/
	},
	hide_search: function() {
		$('.body_container').removeClass('blur');
		$('.overlay_black').animate({
			'opacity': 0
		}, 500, 'easeInExpo', function() {
			$(this).css({
				'display': 'none'
			});
			$('.search_container').css('display', 'none');
		});
		//$('.overlay_black').unbind('click');
	},
	search_content: Array(),
	traverse_definition: function() {
		var branch = this;
		var definition = branch.root.definition;
		for(var x in definition.pages) {
			var page = definition.pages[x];
			if(typeof page.user_access === 'undefined' || page.user_access == 'everyone') {
				for(var y in page.content) {
					var content = page.content[y];
					if(content.type == 'table' && typeof content.post_data === 'undefined') {
						var content_copy = branch.root.functions.copy_object(content);
						content_copy.search_object = true;
						this.search_content.push(content_copy);	
					}
				}
			}
		}
		this.search_content = this.search_content.concat(branch.root.definition.search.objects);
	}
};