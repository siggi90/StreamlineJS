app.dialog = {
	$dialog: null,
	$overlay_black: null,
	$yes_button: null,
	$no_button: null,
	$ok_button: null,
	init: function(message, yes_callback, no_callback, ok_callback) {
		var branch = this;
		branch.$overlay_black = $('.overlay_black');
		branch.$dialog = branch.$overlay_black.find('.dialog');
		branch.$yes_button = branch.$dialog.find('.yes_button');
		branch.$no_button = branch.$dialog.find('.no_button');
		branch.$ok_button = branch.$dialog.find('.ok_button');
		branch.$controls_ok = branch.$dialog.find('.controls_ok').first();
		branch.$controls_yes = branch.$dialog.find('.controls_yes').first();
		branch.$dialog.find('.message').html(message);
		if(typeof yes_callback !== 'undefined') {
			branch.$controls_yes.show();
			branch.$controls_ok.hide();
			branch.$yes_button.off('click.dialog').on('click.dialog', function() {
				yes_callback();
				branch.hide();
			});
			branch.$no_button.off('click.dialog').on('click.dialog', function() {
				if(typeof no_callback !== 'undefined') {
					no_callback();	
				}
				branch.hide();
			});
		}
		if(typeof ok_callback !== 'undefined') {
			branch.$controls_yes.hide();
			branch.$controls_ok.show();

			branch.$ok_button.off('click.dialog').on('click.dialog', function() {
				if(typeof ok_callback !== 'undefined') {
					ok_callback();	
				}
				branch.hide();
			});
		}
		branch.show();
	},
	show: function() {
		var branch = this;
		$('.body_container').addClass('blur');
		branch.$dialog.css({
			'display': 'block',
			'opacity': 1
		});
		branch.$overlay_black.css({
			'display': 'block',
			'opacity': 0
		}).animate({
			'opacity': 1
		}, 1250, 'easeInOutQuint');
	},
	hide: function() {
		var branch = this;
		$('.body_container').removeClass('blur');
		branch.$overlay_black.animate({
			'opacity': 0
		}, 1250, 'easeInOutQuad', function() {
			$(this).css({
				'display': 'none'
			});
			branch.$dialog.css({
				'display': 'none',
				'opacity': 0
			});	
		});	
	}
};