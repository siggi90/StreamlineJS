app.navigation = {
	recent_hash: null,
	hash_value: null,
	last_hash_value: null,
	state_set: false,
	reload_hash: function() {
		if(this.default_route_set) {
			window.location.hash = "";
		}
	},
	init: function() {
		/*$(window).on('unload', function() {
			alert('reload');
		});*/
	},
	last_valid_navigation: null,
	default_route_set: false,
	refresh: false,
	compare_hash: function(hash, recent_hash) {

		if(hash != null && hash.substr(0, 1) == '#') {
			hash = hash.substr(1);
		}
		if(recent_hash != null && recent_hash.substr(0, 1) == '#') {
			recent_hash = recent_hash.substr(1);
		}
		if(hash == recent_hash) {
			return true;
		}
		return false;
	},
	poll_hash: function() {
		var branch = this;
		var self = this;
		var set_hash_value;
		if(!this.compare_hash(window.location.hash, this.recent_hash)) {
			//alert(window.location.hash);
			//alert(this.recent_hash);
			if(this.recent_hash == null) {
				this.refresh = true;	
			} else {
				this.refresh = false;	
			}
			/*alert('not same');
			alert(window.location.hash);
			alert(this.recent_hash);*/
			branch.default_route_set = false;
			if(window.location.hash != "" && typeof branch.root.definition !== 'undefined' && typeof branch.root.definition.routes !== 'undefined') {
				for(var x in branch.root.definition.routes.default_route) {
					if(window.location.hash == "#"+branch.root.definition.routes.default_route[x]) {
						branch.default_route_set = true;	
					}
				}
			}
			this.recent_hash = window.location.hash;
			if(this.recent_hash.substr(0, 1) == '#') {
				this.hash_value = this.recent_hash.substr(1);
			}
			/*if(branch.root.definition.developer_mode) {
				var $developer_overlay = $('.developer_overlay');
				if(this.refresh) {
					branch.root.interpretation.sub_render_page(branch.root.developer_definition.pages[0], null, $developer_overlay.find('.add_form_element').first());
				} else {
					$developer_overlay.fadeOut('fast');
				}
			}*/
			if(!this.state_state) {
				branch.root.post(branch.root.actions, {
					'action': 'get_state'	
				}, function(state_data) {
					branch.state_set = true;
					for(var x in state_data) {
						branch.root[x] = state_data[x];
					}
					if(window.location.hash == "") {
						if(typeof branch.root.definition.routes !== 'undefined') {
							if(typeof branch.root.definition.routes.default_route !== 'undefined') {
								if(branch.root.user_id == "-1" || typeof branch.root.user_id === 'undefined') {
									set_hash_value = "#"+branch.root.definition.routes.default_route.everyone;	
								} else {
									if(typeof branch.root.user_group !== 'undefined' && typeof branch.root.definition.routes.default_route[branch.root.user_group] !== 'undefined') {
										set_hash_value = "#"+branch.root.definition.routes.default_route[branch.root.user_group];
									} else {
										set_hash_value = "#"+branch.root.definition.routes.default_route.user;
									}
								}
							}
						} else {
							set_hash_value = "#index";	
						}
						if(typeof set_hash_value !== 'undefined') {
							branch.default_route_set = true;
							branch.recent_hash = set_hash_value;
							branch.hash_value = set_hash_value.substr(1);
							history.replaceState(undefined, undefined, set_hash_value)	
						}
					}
					branch.open_tab();
					branch.state_set = true;
				}, "json", function() {
					branch.set_last_valid_navigation();
				});
			} else {
				branch.open_tab();	
			}
		}
		setTimeout(function() {
			self.poll_hash();
		}, 400);
	},
	parse_get_data: function(get_string) {
		var split = get_string.split("&");
		var id = split[0];
		delete split[0];
		var get_data = {};
		for(var x in split) {
			var sub_split = split[x].split("=");
			if(sub_split.length >= 2) {
				get_data[sub_split[0]] = sub_split[1].split('%20').join(' ');
			}
		}
		if(id.trim().length > 0) {
			get_data.id = id;
		}
		return get_data;
	},
	access_granted: true,
	$parse_render_frame: null,
	parse_render: function(split, frame, $frame, id, get_data, frame_depth_offset) {
		this.access_granted = true;
		var branch = this;
		branch.$parse_render_frame = $frame;
		var split_index = 0;
		var continue_render = function(x) {
			var last_level_rendered = -1;
			//for(var x in split) {
				if(split[x].indexOf('#') != -1) {
					var id_split = split[x].split('#');
					split[x] = id_split[0];
					id = id_split[1];
					get_data = branch.parse_get_data(id);
				}
				(function(frame, $frame, page, get_data) {
					var callback = function() {
							/*var parent_level = x-1;
							if(parent_level >= 0) {
								$parent_frame = branch.frames.find_frame(parent_level);
								
								if($parent_frame.find('.menu_top').length > 0) {
									var $menu_button = $parent_frame.find('.menu_button.'+page+'_button');
									$menu_button.parent().children().each(function() {
										$(this).css('color', 'inherit');
									});
									$menu_button.first().css('color', '#fff');
								}
							}*/
						last_level_rendered = x;
						frame = null;
						if(split.length-1 != x) {
							$frame = branch.frames.find_frame(parseInt(x)+1+parseInt(frame_depth_offset));
							branch.$parse_render_frame = $frame;
						}
						var send_x = x+1;
						branch.access_granted = true;
						if(send_x < split.length) {
							continue_render(send_x);
						}
					}
					var page_object = null;
					if(page.length > 0) {
						page_object = branch.root.interpretation.find_page(page);
					} else {
						return;	
					}
					var page_render = function() {
						if((typeof id !== 'undefined' && typeof page_object.no_get_data === 'undefined') || typeof page_object.no_get_id !== 'undefined') { // 
							var post_data = {
								'action': 'get_'+page,
								//'id': id	
							};
							if(typeof get_data !== 'undefined') {
								for(var x in get_data) {
									post_data[x] = get_data[x];
								}
							}
							branch.root.post(branch.root.actions, post_data, function(data) {
								if(typeof get_data !== 'undefined') {
									data.id = get_data.id;
									for(var x in get_data) {
										if(typeof data[x] === 'undefined') {
											data[x] = get_data[x];
										}
									}
								}
								branch.root.interpretation.render_page(page_object, frame, $frame, callback, data);
								return false;
							}, "json");
						} else {
							branch.root.interpretation.render_page(page_object, frame, $frame, callback, get_data);
						}	
					}
					if(typeof page_object.user_access !== 'undefined' && page_object.user_access !== 'user' && page_object.user_access !== 'everyone') {
						if(branch.root.user_id == -1) {
							branch.access_granted = false;					
							branch.root.user_menu.login_callbacks.push(function() {
								page_render();
							});
						} else {
							$.post(branch.root.actions, {
								action: '_user_group_member',
								groupd_name: page_object.user_access	
							}, function(data) {
								if(data == 1) {
									page_render();	
								} else {
									/*branch.root.user_menu.login_callbacks.push(function() {
										page_render();
									});*/
									//branch.access_granted = false;
									branch.root.interpretation.view.pop_up.display("You do not have access to this page.", "fadeout");
								}
								//return false;
							});
						}
					} else {
						if(typeof page_object.user_access !== 'undefined' && page_object.user_access == 'user') {
							if(branch.root.user_id == -1) {
								branch.access_granted = false;
								branch.root.user_menu.login_callbacks.push(function() {
									page_render();
								});
							} else {						
								page_render();	
							}
						} else {
							page_render();	
						}
					};
				}(frame, branch.$parse_render_frame, split[x], get_data));
				
			//}/* else {*/
			if(x == split.length-1 || !branch.access_granted) {
				
				if(branch.root.interpretation.bottom_frame != branch.root.interpretation.current_render_frame && branch.root.interpretation.bottom_frame !== null && typeof branch.root.interpretation.bottom_frame.__default_page !== 'undefined') {
					if(last_level_rendered != branch.root.interpretation.bottom_frame.level) { //&& !branch.refresh
						var href = branch.hash_value+"/"+branch.root.interpretation.bottom_frame.__default_page;
						branch.set_hash(href, false);
					}
					//alert(branch.root.interpretation.bottom_frame.__default_page);
				}
				if(branch.access_granted) {
					branch.root.user_menu.remove_login_overlay();
				} else {
					branch.root.user_menu.display_login_overlay();	
				}
			}
			//}
		};
		
		/*if(!branch.state_set) {
			$.post(branch.root.actions, {
				'action': 'get_state'	
			}, function(state_data) {
				branch.state_set = true;
				//alert(state_data);
				for(var x in state_data) {
					//alert(x);
					//alert(state_data[x]);
					branch.root[x] = state_data[x];
				}
				continue_render(split_index);
			}, "json");
			//alert('test');
		} else {
			continue_render(split_index);	
		}*/
		continue_render(split_index);	
		
		/*if(!this.search_initialized) {
			branch.root.search.init();	
			branch.search_initialized = true;
		}*/
	},
	search_initialized: false,
	open_tab: function() {
		var branch = this;
		var split = this.hash_value.split("/");
		if(this.last_hash_value === null) {
			/*if(this.hash_value.indexOf('/') === -1) {
				split = Array(this.hash_value);	
			}*/
			var frame = 'body';
			var $frame;
			var id;
			var get_data;
			this.parse_render(split, frame, $frame, id, get_data, 0);
		} else {
			var split_last_hash = this.last_hash_value.split("/");
			var altered_level = -1;
			var page;
			for(var x in split) {
				if(split[x] != split_last_hash[x] && altered_level == -1) {
					altered_level = x;	
					page = split[x];
				}
			}
			//var id;
			
			var altered_string = Array();
			for(var x in split) {
				if(x >= altered_level) {
					//alert(split[x]);
					altered_string.push(split[x]);	
				}
			}
			if(altered_level != -1) {
				$frame = this.frames.find_frame(altered_level);
				this.parse_render(altered_string, null, $frame, id, get_data, altered_level);
			}
			
			/*if(page.indexOf('#') != -1) {
				var id_split = page.split('#');
				page = id_split[0];
				id = id_split[1];
				get_data = branch.parse_get_data(id);
			}
			$frame = this.frames.find_frame(altered_level);
			var parent_level = altered_level-1;
			if(parent_level >= 0) {
				$parent_frame = this.frames.find_frame(parent_level);
				if($parent_frame.find('.menu_top').length > 0) {
					if($parent_frame.find('.menu_button.'+page+'_button').length > 0) {
						$parent_frame.find('.menu_button.'+page+'_button').parent().children().each(function() {
							$(this).css('color', 'inherit');
						});
						$parent_frame.find('.menu_button.'+page+'_button').first().css('color', '#fff');
					}
				}
			}
			var page_object = branch.root.interpretation.find_page(page);
			var page_render = function() {
				if(typeof id !== 'undefined' && typeof page_object.no_get_data === 'undefined') {
					var post_data = {
						'action': 'get_'+page,
						groupd_name: page_object.user_access
						//'id': id	
					};
					for(var x in get_data) {
						post_data[x] = get_data[x];
					}	
					$.post(branch.root.actions, post_data, function(data) {
						data.id = id;
						branch.root.interpretation.render_page(page_object, null, $frame, function() {}, data);	
					}, "json");
				} else {
					branch.root.interpretation.render_page(page_object, null, $frame, function() {}, get_data);	
				}
			}
			
			if(typeof page_object.user_access !== 'undefined') {
				$.post(branch.root.actions, {
					action: 'user_group_member'	
				}, function(data) {
					if(data == 1) {
						page_render();	
					} else {
						alert('no access');	
					}
				});
			} else {
				page_render();	
			}*/
		}
		this.last_valid_navigation = this.hash_value;
		this.last_hash_value = this.hash_value;
	},
	set_last_valid_navigation: function() {
		//this.set_hash(this.last_valid_navigation);
		if(this.last_valid_navigation != null) {
			this.recent_hash = this.last_valid_navigation;
			this.hash_value = this.last_valid_navigation;//.substr(1);
			window.location.hash = this.last_valid_navigation;
		}
	},
	set_hash: function(value, set_recent) {
		window.location.hash = value;
		if(typeof set_recent === 'undefined') {
			this.recent_hash = value.substr(1);
			this.hash_value = this.recent_hash;
		}
	},
	generate_href: function(page, level, id, get_data, frame_id) {
		var page_object = this.root.interpretation.find_page(page);
		if(typeof page_object.page_href !== 'undefined') {
			return page_object.page_href;
		}
		if(typeof frame_id !== 'undefined') {
			level = this.frames.find_frame_depth(frame_id);	
		}
		var hash = this.hash_value;
		var split = hash.split("/");
		var result = "";
		for(var x in split) {
			if(x < level) {
				if(x > 0) {
					result += "/";	
				}
				result += split[x];	
			} else if(x == level) {
				if(x > 0) {
					result += "/";	
				}
				result += page;	
			}
		}
		if(split.length-1 < level) {
			result += "/"+page;	
		}
		var hash_inserted = false;
		var result = '#'+result;
		if(typeof id !== 'undefined' && id != null) {
			result += "#"+id;
			hash_inserted = true;	
		}
		if(typeof get_data !== 'undefined' && get_data !== null) {
			if(typeof get_data.id !== 'undefined') {
				result += "#"+get_data.id;	
				delete get_data.id;
				hash_inserted = true;
			}
			//if(typeof id === 'undefined' && get_data.id === 'undefined') {
			if(!hash_inserted) {
				result += '#';	
			} else if(!id) {
				result += "&";	
			}
			var counter = 0;
			for(var x in get_data) {
				//if(counter > 0) {
					result += "&";	
				//}
				result += x+"="+get_data[x];
				counter++;	
			}
		}
		return result;
	},
	navigate_to: function(page_id, send_data, return_value) {
		if(typeof send_data === 'undefined') {
			send_data = {
				
			};
		}
		var last_hash_split = this.hash_value.split("/");
		last_hash_split[last_hash_split.length-1] = page_id;
		//if(send_data.length > 0) {
			last_hash_split[last_hash_split.length-1] += '#';
		//}
		
		
		var counter = 0;
		if(typeof send_data.id !== 'undefined') {
			last_hash_split[last_hash_split.length-1] += send_data.id;	
			delete send_data.id;
			counter++;
		}
		for(var x in send_data) {
			last_hash_split[last_hash_split.length-1] += "&";	
			last_hash_split[last_hash_split.length-1] += x+"="+send_data[x];
			counter++;	
		}
		
		var new_hash_value = last_hash_split.join("/");
		if(typeof return_value === 'undefined') {
			this.set_hash(new_hash_value, false);
		} else {
			return '#'+new_hash_value;	
		}
	},
	frames: {
		find_frame: function(depth) {
			return this.find_frame_sub(depth, $('.body_wrap'));
		},
		find_frame_sub: function(depth, $parent) {
			var branch = this;
			$parent = $parent.find('.frame').first();
			//alert(depth+" - "+$parent.attr('id'));
			if($parent.length == 0) {
				//var set_hash_value = "#";	
				l//ocation.hash = set_hash_value;
				//window.location.reload();
				window.location.hash = '#';
				/*setTimeout(function() {
					
				});*/
				return;
				
				//alert('no frame');	
			}
			if(depth == 0) {
				return $parent;	
			}
			return this.find_frame_sub(depth-1, $parent);	
		},
		find_frame_depth: function(target_frame) {
			var branch = this;
			//this.root.traverse(this.root.elements.frames, 0);
			//alert(target_frame);
			var target_frame_object = this.root.eval_object_path(this.root.find("elements.frames", target_frame), "this");
			//alert(target_frame_object.id);
			//alert(target_frame_object.sub_features);
			var target_frame_depth = target_frame_object.level;
			//alert(target_frame_depth);
			//var target_frame_depth = branch.root.depth(target_frame_object, branch.root.elements.frames, 0);
			return target_frame_depth;
		}
	}
};