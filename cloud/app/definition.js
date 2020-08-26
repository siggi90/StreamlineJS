app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "home/apps",
			"user": "home/apps",
			"admin": "index/apps"		
		}
	},
	"pages": [
		{
			"id": "index",
			"icon": "logo",
			"title": "Noob Cloud",
			"user_access": "user",
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "introduction"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"apps",
						"overview",
						"users",
						"invite",
						"settings"
					]
				}
			]
		},
		{
			"id": "home",
			"icon": "logo",
			"title": "Noob Cloud",
			"user_access": "user",
			"display_title": true,
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "introduction"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"apps"
					]
				}
			]
		},
		{
			"id": "overview",
			"title": "Overview",
			"user_access": "admin",
			"content": [
				{
					"type": "title",
					"value": "Updates"
				},
				{
					"type": "content",
					"id": "updates_description",
					"content": "Updates will overwrite existing files. Click update to recieve and install updates."	
				},
				{
					"type": "custom_frame",
					"id": "update",
					"link": "updates_container"	
				},
				{
					"type": "content",
					"id": "updates_description_2",
					"content": "Once updates are downloaded and install you will have an SQL file in the sql folder in the server root. Run the .sql file and then delete it."	
				},
			]
		},
		{
			"id": "apps",
			"title": "Apps",
			"user_access": "user",
			"content": [
				{
					"type": "content",
					"id": "organization_apps_header",
					"content": "Organization"	
				},
				{
					"type": "options",
					"id": "organization_apps",
					"content": "fetch",
					"target": "href"
				},
				/*{
					"type": "content",
					"id": "web_apps_header",
					"content": "Web"	
				},
				{
					"type": "options",
					"id": "web_apps",
					"content": "fetch",
					"target": "href"
				},
				{
					"type": "content",
					"id": "entertainment_apps_header",
					"content": "Entertainment"	
				},
				{
					"type": "options",
					"id": "entertainment_apps",
					"content": "fetch",
					"target": "href"
				},*/
				/*{
					"type": "content",
					"id": "mathematics_apps_header",
					"content": "Mathematics"	
				},
				{
					"type": "options",
					"id": "mathematics_apps",
					"content": "fetch",
					"target": "href"
				}*/
			]
		},
		{
			"id": "invite",
			"title": "Invite Users",
			"user_access": "admin",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Here you can generate an invite link for creating an account for general users or users groups."	
				},
				{
					"type": "form",
					"id": "invite_key",
					"title": "New Key",
					"save": true,
					"new_on_save": true,
					"on_submit": [
						"invite_keys_table"
					],
					"content": [
						{
							"type": "select",
							"id": "user_group",
							//"persist_value": true,
							"optional_field": true,
							"content": "fetch",
							/*"on_change": [
								"publications_table"	
							],
							"on_change_load_mask": {
								"id": "category_id"	
							}
							/*"dependencies": [	//gæti líka verið table með dependency a select, þannig að þegar selectid breytist breytist hverfur og birtist önnur tafla
								{
									"link": "article_form.content_type",
									"value": "1"
								}
							]*/	
						},
					]
				},
				{
					"type": "content",
					"id": "instructions_2",
					"content": "To send invite link right click key and select 'copy link location'. Then you can paste the link to others. When all users have completed signing up you can delete the invite key."
				},
				{
					"type": "table",
					"id": "invite_keys",
					"delete": true,
					"target": "invite_key_form",
					"columns": {
						"value": "Key",
						"group_name": "User Group"
					},
					/*"column_width": {
						"email": "auto",
						"edit_button": "100px",
						"delete_button": "100px",
						"custom_action": "100px" 
					},
					/*"custom_actions": {
						"view": {
							"target_href": "stats",
							"href_data": {
								"user_group_id": "id"
							}
						}
					}*/
				},
			]
		},
		{
			"id": "users",
			"title": "Users",
			"user_access": "admin",
			"content": [
				{
					"type": "content",
					"id": "desc",
					"content": "Here you can add and remove users groups and users. Deleting a user will only remove the user from this Noob Cloud."	
				},
				{
					"type": "form",
					"id": "user_group",
					"title": "New User Group",
					"new_on_save": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Group Name"
						},
						{
							"type": "text",
							"id": "description",
							"placeholder": "Group description"
						}
					],
					"save": true,
					"new": true,
					"on_submit": [
						"user_groups_table"
					],
					"on_load": [
						"users_table",
						"user_form"
					],
					"on_load_load_mask": {
						"id": "user_group_id"	
					}	
					/*"on_load": [
						"publications_table",
						"publication_form"
					],
					"on_load_load_mask": {
						"id": "category_id"	
					}*/
				},
				{
					"type": "table",
					"id": "user_groups",
					"edit": true,
					"delete": true,
					"search": true,
					"target": "user_group_form",
					"columns": {
						"name": "Group name",
						"description": "Description"
					},
					"column_width": {
						"email": "auto",
						"edit_button": "100px",
						"delete_button": "100px",
						"custom_action": "100px" 
					},
					/*"custom_actions": {
						"view": {
							"target_href": "stats",
							"href_data": {
								"user_group_id": "id"
							}
						}
					}*/
				},
				{
					"type": "form",
					"id": "user",
					"title": "New User",
					"new_on_save": true,
					"content": [
						/*{
							"type": "hidden",
							"id": "user_group_id",
							"ignore_reset": true,	
						},*/
						{
							"type": "text",
							"id": "email",
							//"validation": true,
							"placeholder": "Email (username)",
							"required_on_edit": false,
							"disabled": true
						},
						/*{
							"type": "password",
							"id": "password",
							"placeholder": "Password",
							"required_on_edit": false
						},*/
						{
							"type": "select",
							"id": "user_group",
							"content": "fetch",
							"persist_value": true
						},
					],
					"save": true,
					"new": true,
					"on_submit": [
						"users_table"
					]	
				},
				{
					"type": "table",
					"id": "users",
					"edit": true,
					"delete": true,
					"target": "user_form",
					"require_foreign_id": true,
					"search": true,
					"columns": {
						"email": "Username",
					},
					"column_width": {
						"email": "auto",
						"edit_button": "100px",
						"delete_button": "100px",
						"custom_action": "100px" 
					},
					/*"custom_actions": {
						"view": {
							"target_href": "stats",
							"href_data": {
								"id": "id"
							}
						}
					}*/
				}
			]
		},
		{
			"id": "settings",
			"title": "Settings",
			"user_access": "admin",
			"content": [
				{
					"type": "content",
					"id": "introduction",
					"content": "You must have a valid URL starting with https://"	
				},
				{
					"type": "form",
					"id": "settings",
					"title": "Settings",
					"peristant_values": true,
					"content": [
						{
							"type": "hidden",
							"id": "server_id",
						},
						{
							"type": "text",
							"id": "web_address",
							"placeholder": "Server Web Address"	
						},
						{
							"type": "text",
							"id": "team_name",
							"placeholder": "Team/Organization Name"	
						},
						{
							"type": "password",
							"id": "password",
							"no_confirmation": true,
							"placeholder": "Your password"
						}
						/*{
							"type": "textarea",
							"id": "description",
							"placeholder": "Web Page Description"	
						}*/
					],
					"save": true,
					"custom_action": "save_settings.save"
				},
			]
		},
	]
}
;