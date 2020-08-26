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
		branch.easings.init();
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
	},
	save_settings: {
		save: function(data, submit_callback) {
			var branch = this;
			data.action = "_update_server";
			$.post("https://www.noob.software/cloud_api/actions.php", data, function(result) {
				data.action = "_settings";
				delete data.password;
				$.post(branch.root.actions, data, function(result) {
					submit_callback(result);
				});
			});
		}
	}
}

$(document).ready(function() {
	app.init();
});