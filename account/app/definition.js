app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "sign_up",
			"user": "index/account"	
		}
	},
	"search": {
		"search_type": "filter",
		"objects": [
		
		]	
	},
	"pages": [
	
		{
			"id": "sign_up",
			"title": "Sign Up",
			"user_access": "everyone",
			"display_title": true,
			"content": [
				{
					"type": "form",
					"id": "user",
					"title": "Create Account",
					"content": [
						{
							"type": "hidden",
							"id": "invite_key"
						},
						{
							"type": "hidden",
							"id": "server_id"
						},
						{
							"type": "text",
							"id": "email",
							"validation": true,
							"placeholder": "Email (username)"
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "Password"
						}
					],
					"save": true,
					"custom_action": "user_submit.init",
					//"custom_action": "create_user.init",
					"redirect": "/cloud/",
					"dependencies": [
						{
							"link": "page_data.access",
							"value": "1"
						}
					],
					"get_load_mask": {
						"id": "invite_key",
						"user_group_id": "user_group_id",
						"server_id": "server_id",
					}	
				},
				{
					"type": "content",
					"id": "no_access",
					"content": "Invalid invite key.",
					"dependencies": [
						{
							"link": "page_data.access",
							"value": "-1"
						}
					]	
				},
				{
					"type": "content",
					"id": "no_access_2",
					"content": "You need an invite key to sign up.",
					"dependencies": [
						{
							"link": "page_data.id",
							"value": "unset"
						}
					]	
				},
			]	
		},
		{
			"id": "index",
			"title": "Account",
			
			"icon": true,
			"user_access": "everyone",
			"content": [
				{
					"type": "frame",
					"id": "main",
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"account"
					]
				}
			]
		},
		{
			"id": "downloads",
			"title": "Downloads",
			"user_access": "everyone",
			"content": [
				{
					"type": "table",
					"id": "downloads",
					"title": "Downloads",
					"columns": {
						"image": "",
						"title": "Download",
						"description": "Description"
					},
					"content": {
						"image": "image"
					},
					"column_width": {
						"image": "50px",
						"title": "300px",
						"description": "auto"	
					},
					"target_frame": "main"
				}
			]
		},
		{
			"id": "account",
			"title": "Account",
			"click": "feature_request",
			"animation": "slide",
			"content": [
				{
					"type": "form",
					"id": "user",
					"title": "Change Password",
					"content": [
						{
							"type": "password",
							"id": "old_password",
							"placeholder": "Old Password",
							"no_confirmation": true
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "Password"
						}
					],
					"save": true,
					"custom_action": "user_submit.change_password",
				},
			]	
		},
		{
			"id": "applications",
			"title": "Applications",
			"user_access": "everyone",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Here you find Noob Web Applications"
				},
				{
					"type": "table",
					"id": "web_applications",
					"title": "Web Applications",
					"columns": {
						"image": "",
						"title": "Application",
						"description": "Description"
					},
					"content": {
						"image": "image"
					},
					"column_width": {
						"image": "50px",
						"title": "300px",
						"description": "auto"	
					},
					"target_frame": "main"
				}
			]
		}
	]
}
;