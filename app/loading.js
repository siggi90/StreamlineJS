app.loading = {
	loading_completed: false,
	overlay_interlope: 1,
	init: function(loaded_callback) {
		var branch = this;
		if(typeof loaded_callback !== 'undefined') {
			this.loaded_callback = loaded_callback;
		}
		if(!this.completed()) {
			//alert('load');
			//this.display_loading_screen();
			$('.loading_window').css({
				'display': 'block',
				'opacity': 0.6	
			});
		}
	},
	complete: function(id) {
		var branch = this;
		if(typeof id !== 'undefined') {
			this.root.loading_completed[id] = true;
		}
		if(this.completed()) {
			setTimeout(function() {
				branch.hide_loading_screen();
				setTimeout(function() {
					if(branch.root.current_user != -1 && branch.overlay_interlope == 1) {
						branch.remove_overlay();
					} /*else {
						
					}*/
				}, 500);
			}, 500);
		}
	},
	loading_overlay_on_display: false,
	display_loading_overlay: function() {
		if(this.loading_overlay_on_display == false) {
			this.loading_overlay_on_display = true;
			$('.overlay_black').find('.loading').show();
			$('.overlay_black').css({
				'display': 'block',
				'opacity': 0
			}).animate({
				'opacity': 1
			}, 1250, 'easeInOutQuint', function() {

			});
		}
	},
	hide_loading_overlay: function() {
		$('.overlay_black').animate({
			'opacity': 0
		}, 1250, 'easeInOutQuint', function() {
			$('.overlay_black').find('.loading').hide();
			$(this).css({
				'display': 'none',
				'opacity': 0
			});
			this.loading_overlay_on_display = false;
		});
	},
	completed: function() {
		var completed = true;
		for(var x in this.root.loading_completed) {
			if(!this.root.loading_completed[x]) {
				completed = false;	
			}
		}
		return completed;
	},
	set_uncompleted: function() {
		for(var x in this.root.loading_completed) {
			if(x != 'app_state') {
				this.root.loading_completed[x] = false;
			}
		}
	},
	display_logo: function() {
		var branch = this;
		/*$('#loading_screen').css({
			'background-image': 'url('+branch.root.app_icon+')'
		});*/
		$('#loading_screen').css({
			'display': 'block',
			'backgroundSize': '200px',
			'opacity': 0.5
		}).animate({
			'opacity': 1
		}, 200, 'easeInQuint');
		setTimeout(function() {
			$('#loading_screen').animate({
				backgroundSize:'500px',
				opacity: 0
			}, 600, 'easeInOutQuad', function() {
				$(this).css('display', 'none');
			});
		}, 700);
	},
	hide_loading_screen: function() {
		$('.loading_window').animate({
			opacity	: 0
		}, 800, 'easeOutQuad', function() {
			$(this).css('display', 'none');	
		});
	},
	display_loading_screen: function() {
		$('.loading_window').css('display', 'block').animate({
			opacity	: 0.6
		}, 800, 'easeInQuint', function() {
			//alert('loading');	
		});
	},
	remove_overlay: function() {
		console.log('remove');
		var branch = this;
		branch.overlay_interlope = 0;
		this.root.unblur_body();
		branch.display_logo();
		$('#login_overlay').animate({
			'opacity': 0
		}, 400, 'easeOutQuint', function() {
			$(this).css('display', 'none');
			branch.root.login.clear_login_image();
		});
	}
};
	