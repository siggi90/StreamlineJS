var app = {
	init: function() {
		var branch = this;
		$.post("/app/base.js", function(data) {
			eval(data);
			for(var x in base) {
				branch[x] = base[x];
			}
			branch.app_init();
		});
	},
	finish_init: function() {	
		var branch = this;
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
	},
	user_submit: {
		init: function(data, submit_callback) {
			var branch = this;
			data.action = "_user";
			var invite_key = data.invite_key;
			delete data.invite_key;
			delete data.id;
			$.post("https://www.noob.software/cloud_api/actions.php", data, function(result) {
				if(result != -1) {
					data.invite_key = invite_key;
					data.user_id = result;
					delete data.server_id;
					$.post(branch.root.actions, data, function(result) {
						submit_callback(result);
					});
				} else {
					submit_callback(result);	
				}
			});
		},
		change_password: function(data, submit_callback) {
			var branch = this;
			data.action = "_change_password";
			data.id = branch.root.user_id;
			$.post("https://www.noob.software/cloud_api/actions.php", data, function(result) {
				if(result != -1) {
					delete data.old_password;
					data.action = "_user";
					$.post(branch.root.actions, data, function(result) {
						submit_callback(result);
					});
				} else {
					submit_callback(result);	
				}
			});
		}
	},
	create_user: {
		init: function(data, submit_callback) {
			var branch = this;
			grecaptcha.ready(function() {
				grecaptcha.execute('your-key-hwere', {action: '_user'}).then(function(token) {
					data.token = token;
					branch.user_submit.init(data, submit_callback);
				});
			});

		}
	}
}

$(document).ready(function() {
	app.init();
});