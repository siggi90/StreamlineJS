var base = {
	obj_id: 'root',
	user_id: "-1",
	actions: "actions.php",
	language: 0,
	use_rtc: false,
	main_settings: {
		get_settings: function() {
			var branch = this;
			$.post(branch.root.actions, {
				'action': 'get_main_settings'
			}, function(data) {
				if(typeof data.bold_font !== 'undefined' && data.bold_font == 1) {
					$('head').first().append("<style id='bold_style'> body, input, select, button { font-weight:100 !important; font-family:'helvetica'; }  </style>");
				} else {
					$('head').find('#bold_style').first().remove();
				}
			}, "json");
		}
	},
	download: {
		download_file: function(data, content_item_id_singular) {
			var branch = this;
			var post_data = {
				'action': 'get_'+content_item_id_singular
			};
			for(var x in data) {
				post_data[x] = data[x];
			}
			branch.root.post(branch.root.actions, post_data, function(data) {
				//alert(data.file_value);
				if(data.file_value.indexOf('data:image/png;') == 0 || data.file_value.indexOf('data:application/pdf;') == 0) { //display images and pdfs download otherwise
					window.open(data.file_value);
				} else {
					branch.download_file_2(data.filename, data.file_value);
				}
			});
		},
		download_file_2: function(filename, content) {
			/*var blob = new Blob([content]);
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("click");
			$("<a>", {
				download: filename,
				href: content//webkitURL.createObjectURL(blob)
			}).get(0).dispatchEvent(evt);*/

			$('#dummy_div').html("<a download='"+filename+"' id='to_download'>download</a>");
			$('#dummy_div').find('#to_download').first().attr('href', content)[0].click();
		}
	},
	post: async function(action, post_data, callback, datatype, error_callback) {
		var branch = this;
		/*if(typeof rtc === 'undefined') {
			rtc = false;	
		}*/
		if(post_data.action.indexOf('delete') != -1) {
			branch.dialog.init("Are you sure you want to delete this item?", async function() {
				//$.post(action, post_data, callback);
				//move to sub-call
				branch.sub_post(action, post_data, callback, datatype, error_callback);
			});
		} else {
			/*if(branch.use_rtc) {
				console.log('ws_send: ');
				//console.log({...post_data});
				var send_post_data = {};
				send_post_data.app_id = branch.app_id;
				for(var x in post_data) {
					send_post_data[x] = post_data[x];
				}

				var result_data = await branch.ws.send(send_post_data, true);
				//if(datatype == 'json') {
					//result_data = JSON.parse(result_data);
					result_data = result_data.ws_message;
				//}
				console.log(result_data);
				if(typeof callback !== 'undefined') {
					callback(result_data);
				}
			} else {
				$.post(action, post_data, callback, datatype);
			}*/
			branch.sub_post(action, post_data, callback, datatype, error_callback);
		}
	},
	sub_post: async function(action, post_data, callback, datatype, error_callback) {
		var branch = this;
		if(branch.use_rtc) {
			var send_post_data = {};
			send_post_data.app_id = branch.app_id;
			for(var x in post_data) {
				send_post_data[x] = post_data[x];
			}

			var result_data = await branch.ws.send(send_post_data, true);
			if(typeof result_data.error !== 'undefined') {
				switch(result_data.error) {
					case 'no_nc':
						setTimeout(function() {
							branch.dialog.init("Lost connection to Noob Cloud, please check your Noob Cloud application, and try again.", undefined, undefined, function() {

							});
							branch.dialog.show();
						}, 1250);
						if(typeof error_callback !== 'undefined') {
							error_callback();
						}
						break;
				}
			} else {
				result_data = result_data.ws_message;
				//console.log(result_data);
				if(typeof callback !== 'undefined') {
					callback(result_data);
				}
			}
		} else {
			$.post(action, post_data, callback, datatype);
		}
	},
	delay: async function(time) {
	    await new Promise(r => setTimeout(r, time)); 
	    return true;
	},
	excluded_properties: Array(
		'inherit',
		'parent',
		'root',
		'obj_id',
		'length',
		'$element'
	),
	assign_root_object: function(object) {
		
		function assign_root(object_path, object) {
			var statement = 'var obj = '+object_path+';';
			//alert(statement);
			eval(statement);
			/*if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}*/
			for(var x in obj) {
				//alert(x);
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined') {
					obj[x].root = object;
					obj[x].parent = obj;
					obj[x].obj_id = x;//object.substr(object.lastIndexOf('.')+1, object.length-1);
					var str = object_path + '.' + x;
					assign_root(str, object);	
				}
			}
		}
		
		assign_root("object", object);
	},
	assign_root: function(path) {
		var root = this;
		function assign_root(object) {
			var statement = 'var obj = '+object+';';
			eval(statement);
			if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}
			for(var x in obj) {
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined') {
					obj[x].root = root;
					obj[x].parent = obj;
					obj[x].obj_id = x;//object.substr(object.lastIndexOf('.')+1, object.length-1);
					var str = object + '.' + x;
					assign_root(str);	
				}
			}
		}
		/*function inherit(object) {
			var statement = 'var obj = '+object+';';
			eval(statement);
			if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}
			for(var x in obj) {
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined') {
					var str = object + '.' + x;
					inherit(str);	
				}
			}
		}*/
		if(typeof path === 'undefined') {
			assign_root("root");
			//inherit("root");
		} else {
			assign_root(path);
			//inherit(path);	
		}
	},
	get_length: function(object) {
		var length = 0;
		for(var x in object) {
			length++;	
		}
		return length;
	},
	gather_form: function($container) {
		var $inputs = $container.find('.input_element');
		var object = {};
		
		$inputs.each(function() {
			var id = $(this).attr('id');
			if(typeof id === 'undefined') {
				id = $(this).attr('class').split(" ")[0];	
			}
			object[id] = $(this).val();
			if(object[id].trim().length == 0 || object[id] == "-1") {
				delete object[id];	
			}
		});
		
		return object;
	},
	app_state: {
		watch_exclude: Array(
			'inherit',
			'value',
			'initialized',
			'alterations',
			'exclude'
		),
		path_exclude: Array(
			'login',
			'loading',
			'alterations',
			'content.html'
		),
		watch_included: function(property) {
			for(var x in this.watch_exclude) {
				if(this.watch_exclude[x] == property) {
					return false;	
				}
			}
			return true;
		},
		path_included: function(property) {
			for(var x in this.watch_exclude) {
				if(this.path_exclude[x] == property) {
					return false;	
				}
			}
			return true;
		},
		assign_watch: function(object) {
			var branch = this;
			var root = this.root;
			function assign_watch(obj, path) {
				/*var statement = 'var obj = '+object+';';
				eval(statement);*/
				if(branch.path_included(path)) {
					for(var x in obj) {
						var included = true;
						if(typeof obj.exclude !== 'undefined') {
							if(obj.exclude[x] !== 'undefined') {
								included = false;	
							}
						}
						if(included) {
							/*if(x == 'list') {
								console.log('path: '+path+'.'+x);
								console.log('is_array: '+Array.isArray(obj[x]));
								console.log('typeof: '+typeof obj[x]);
								console.log(obj[x]);	
							}*/
							if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
								x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined' && !(obj[x] instanceof jQuery)) {
								var str;
								if(path.length > 0) {
									str = path + '.' + x;
								} else {
									str = x;	
								}
								/*var statement = "var child = branch."+str+";";
								eval(statement);*/
								console.log('object assign: '+str);
								assign_watch(obj[x], str);	
							} else if(Array.isArray(obj[x]) && branch.watch_included(x)) {
								console.log('assign array: '+path+"."+x);
								for(var index in obj[x]) {
									var compound_path = path+"."+x+"["+index+"]";
									console.log('object assign: '+compound_path);
									assign_watch(obj[x][index], compound_path);	
								}
							} else if(!Array.isArray(obj[x]) && typeof obj[x] !== 'object' && typeof obj[x] !== 'function' && branch.watch_included(x)) {
								var object_path;
								if(path.length > 0) {
									object_path = path + '.' + x;
								} else {
									object_path = x;	
								}
								console.log('watched property: '+object_path);
								var state_set = function(object_path) {
									return function(id, old_value, new_value) {
										console.log('app_state_set: '+object_path+': '+new_value);
										branch.set_app_state(object_path, new_value);
										return new_value;
									};
								};
								obj.unwatch();
								obj.watch(x, state_set(object_path)/*function(id, old_value, new_value) {
									//if(obj.initialized) {
										var object_path;
										if(path.length > 0) {
											object_path = path + '.' + id;
										} else {
											object_path = x;	
										}
										console.log('app_state_set: '+object_path+': '+new_value);
										branch.set_app_state(str, new_value);
									//}
								}*/);
							}
						}
					}
				}
			}
			if(typeof object === 'undefined') {
				assign_watch(root, "");
			} else {
				var path = this.root.abs_path(object);
				assign_watch(object, path);	
			}
		},
		app_state_queue: Array(),
		app_state_submit_timeout: null,
		set_app_state: function(path, value) {
			var branch = this;
			/*var path = this.path(obj)+'.'+property;
			path = path.substr(5, path.length-1);*/
			//var value = eval('this.'+path);
			this.app_state_queue.push({
				property: path,
				value: value
			});
			clearTimeout(this.app_state_submit_timeout);
			this.app_state_submit_timeout = setTimeout(function() {
				branch.submit_app_state();
			}, 1000);
		},
		submit_app_state: function() {
			var branch = this;
			console.log('app_state_queue');
			console.log(this.app_state_queue);
			$.post(this.root.responder, {
				action: 'submit_app_state',
				app_state: JSON.stringify(this.app_state_queue)		
			}, function(data) {
			});
			branch.app_state_queue = Array();
		},
	},
	parent: function(object, level) {
		if(level > 0) {
			return this.parent(object.parent(), level-1);
		}
		return object.parent();
	},
	find: function(base, object, sub_call) {
		var self = this;
		var statement = 'var obj = this.'+base+';';
		eval(statement);
		if(object == '') {
			return false;
			//return obj;	
		}
		var return_array = [];
		for(var x in obj) {
			var child = base+'.'+x;
			if(x == object) {
				return_array.push(child);	
			} else if(this.excluded_properties.indexOf(x) === -1 && x.substr(0, 2) !== '__') {
				var children_return = self.find(child, object, true);
				for(var x in children_return) {
					return_array.push(children_return[x]);	
				}
			}
		}
		if(typeof sub_call === 'undefined') {
			return return_array[0];	
		}
		return return_array;
		
	},
	eval_object_path: function(object_path, base) {
		if(typeof base !== 'undefined') {
			base = base+".";	
		}
		var statement = "var object = "+base+object_path+";";
		eval(statement);
		return object;
	},
	depth: function(object, base, depth) {
		if(object == base) {
			return depth;	
		}
		/*if(typeof object === 'undefined') {
			return null;	
		}*/
		return this.depth(object.parent, base, depth+1);
		
	},
	traverse: function(object, level) {
		for(var x in object) {
			if(this.excluded_properties.indexOf(x) == -1) {
				this.traverse(object[x], level+1);	
			}
		}
	},
	obj_length: function(obj) {
		var length = 0;
		for(var x in obj) {
			length++;	
		}
		return length;
	},
	path: function(object) {
		//if(typeof object.parent !== 'undefined') {
		if(object.obj_id != 'root') {
			return this.path(object.parent)+'.'+object.obj_id;
		} else {
			return object.obj_id;	
		}
	},
	abs_path: function(object) {
		var path = this.path(object);
		path = path.substr(5, path.length-1);
		return path;
	},
	create_context: function(obj) {
		if(typeof obj.nodeType == 'number') {
			obj.$this = $(obj);
			obj.self = obj;

		} else if(typeof obj == 'object' && typeof obj.nodeType == 'undefined') {
			obj.$this = obj;
			obj.self = obj[0];
		}
	},
	_self: function(obj) {
		var _self = {};
		if(typeof obj.nodeType == 'number') {
			_self.$this = $(obj);
			_self.self = obj;

		} else if(typeof obj == 'object' && typeof obj.nodeType == 'undefined') {
			_self.$this = obj;
			_self.self = obj[0];
		}
		return _self;
	},
	set_state: function(property, obj) {
		/*var path = this.path(obj)+'.'+property;
		path = path.substr(5, path.length-1);
		var value = eval('this.'+path);
		$.post(this.actions, {
			action: 'set_app_state',
			property: path,
			value : value			
		});*/
	},
	/*html: {
		html_data: Array(),
		get_html: function(ids, callback) {
			var self = this;
			var id = ids.pop();
			$.get('/control/html/'+id, 
				function(data) {
					self.html_data[id.substr(0, id.indexOf('.html'))] = data;
					if(ids.length > 0) {
						self.get_html(ids, callback);
					} else {
						callback();	
					}
			});
		}
	},*/
	frame_init: function() {
		var branch = this;
		var win = window.parent;
		window.addEventListener("message", function(event) {
			alert( "received: " + event.data );
			if(event.origin == 'http://noob.software' || event.origin == 'http://www.noob.software') {
				var split;
				var hash = "";
				if(event.data.indexOf('hash') != -1) {
					split = event.data.split('hash:');
					hash = split[1];
					window.location.hash = hash;
				}
			}
		});
		
		window.addEventListener("hashchange",function(event){
			//alert('hash_set:'+window.location.hash);
			//branch.nav.navigate(window.location.hash);
		});
		
	},
	loading_completed: Array(),
	app_init: function() {
		var self = this;
		this.extensions();
		//self.assign_root();
		/*$.post(this.actions, {
			action: 'get_sess_id'	
		}, function(data) {
			alert(data);
		});*/
		if(window.location.href.trim().indexOf('https') != 0 && window.location.href.trim().indexOf('myndasaga') == -1  && window.location.href.trim().indexOf('192.168') == -1) {
			window.location.href = "https://"+window.location.href.split('http://').join('');
		}
		$.post(this.actions, {
			action: 'assets'
		}, function(data) {
			//alert(data);
			eval(data);
			for(x in root_assign) {
				var path = root_assign[x];
				//alert(path);
				path = path.substr(0,path.lastIndexOf('.'));
				self.assign_root(path);
			}
			
				
			self.finish_init();
			
			self.loading_completed['app_state'] = false;
			self.loading.init();

			self.main_settings.get_settings();
			
			//alert(self.login);
			
			/*self.login.init(function() {
				$.post(self.responder, {
					action: 'get_app_state'
				}, function(data) {
					//var data = eval(data);
					for(x in data) {
						var row = data[x];
						var handler = '';
						var obj = data[x].property.split('.');
						for(x = 0; x < (obj.length-1); x = x+1) {
							if(x > 0) {
								handler += '.';
							}
							handler += obj[x];
						}
						var obj = obj[obj.length-2];
						//((row.value.toLowerCase() == 'true' || row.value.toLowerCase() == 'false') && typeof eval(row.value) === 'bool')
						if(isNaN(row.value) && row.value.toLowerCase() != 'false' && row.value.toLowerCase() != 'true') { // && 
							row.value = "'"+row.value+"'";	
						}
						var prop_statement = 'var property = self.'+row.property+';';
						eval(prop_statement);
						if(typeof property !== 'undefined') {
							var statement = 'self.'+row.property+" = "+row.value+";";
							eval(statement);
						} else {
							var init_parent = self.functions.find_init_parent(row.property, 0);
							if(typeof init_parent.post_init_state === 'undefined') {
								init_parent.post_init_state = Array();	
							}
							//var statement = 'this.root.'+row.property+" = "+row.value+";";
							init_parent.post_init_state.push(row);
							init_parent.init_parent_level = 1;	
						}
						//eval('var init = self.'+handler+'.initialized');
						//if(init == false || typeof init === 'undefined') {
						//	statement = 'self.'+handler+'.init();';
						//	eval(statement);
						//	statement = 'self.'+handler+'.initialized = true;';
						//	eval(statement);
						//}
					}
					self.loading.complete('app_state');
					//self.colors.generate_colors(true);
					self.loading.init();	
					self.finish_init();
					//self.menu.init();
					//self.input.init();
					//self.home.init();
					//self.app_state.assign_watch(self.home);
					//$(window).unload(function() {
					$(window).on('unload', function() {
						clearTimeout(self.app_state.app_state_submit_timeout);
						self.app_state.submit_app_state();
					});
					//self.finish_init();
					//self.assign_root();
					//self.user.init();
					//calculator
				}, "json");
			});*/
			
		});
	},
	extensions: function() {
		/*$.extend($.easing, {
			smooth_switch: function (x, t, b, c, d) {
				console.log('x: '+x);
				console.log('t: '+t);
				console.log('b: '+b);
				console.log('c: '+c);
				console.log('d: '+d);
				//return c*(t/=d)*t + b;
				return Math.pow(x, 0.22222);
				//return x;
				//return c*Math.pow(x*d, 0.22222)+b;
				//return c*Math.pow(t*d, 0.22222)+b;
			}
		});*/
		if (!Object.prototype.watch) {
			Object.defineProperty(
			Object.prototype,
			"watch", {
				enumerable: false,
				configurable: true,
				writable: false,
				value: function (prop, handler) {
					var old = this[prop];
					var cur = old;
					var getter = function () {
						return cur;
					};
					var setter = function (val) {
						old = cur;
						cur = handler.call(this,prop,old,val);
						return cur;
					};
					
					//if(delete this[prop]) {
						Object.defineProperty(this,prop,{
							get: getter,
							set: setter,
							enumerable: true,
							configurable: true
						});
					//}
				}
			});
		}
		/*if (!Object.prototype.unwatch) {
			Object.defineProperty(Object.prototype, "unwatch", {
				  enumerable: false
				, configurable: true
				, writable: false
				, value: function (prop) {
					var val = this[prop];
					delete this[prop]; // remove accessors
					this[prop] = val;
				}
			});
		}*/
	},
	post_init_state: Array(),
	dump_list: Array(),
	dump: function(html) {
		$('#div_manipulation').html(html);
		return $('#div_manipulation');
	},
	manipulate: {
		list: Array(),
		counter: 0,
		dump: function(html) {
			var class_string = "dump_container_"+(this.counter++);
			var html = "<div class='"+class_string+"'>"+html+"</div>";
			$('#dummy_div').append(html);
			return { 
				$item: $('#dummy_div').find('.'+class_string),
				clear: function() {
					$('#dummy_div').find('.'+class_string).remove();
				}
			};
		}
	},
	manipulate_div: function(html, obj) {
		if(typeof html === 'object') {
			html = html.html();	
		}
		$div_man = $('#div_manipulation');
		$div_man.html(html);
		$div_man.get_html = function() {
			var html = $div_man.html();
			$div_man.html("");
			return html;
		};
		return $div_man;
	},
	shift_phase: false,
	shift_init: function() {
		var self = this;
		$(document).keydown(function(e) {
			var key;
			if(e.which) {
				key = e.which;
			}
			if(e.keyCode) {
				key = e.keyCode;
			}
			if(key == 16) {
				self.shift_phase = true;	
			}
		});
		$(document).keyup(function(e) {
			if(self.shift_phase) {
				var key;
				if(e.which) {
					key = e.which;
				}
				if(e.keyCode) {
					key = e.keyCode;
				}
				if(key == 16) {
					self.shift_phase = false;
				}
			}
		});
	},
	custom_elements: {},
	current_user: -1,
	functions: {
		copy_object: function(object, copy) {
			for(x in copy) {
				//var str = 'object.'+x+' = copy.'+x;
				//eval(str);
				object[x] = copy[x];
			}	
			//return object;
		},
		inherit: function(parent_path, child) {
			var statement = "var parent_object = this.root."+parent_path+";";
			eval(statement);
			for(x in parent_object) {
				if(typeof child[x] === 'undefined') {
					var str = 'child.'+x+' = parent_object.'+x+';';
					eval(str);
				}
			}	
			return child;
		},
		find_init_parent: function(path, level, cutoff) {
			var prefix;
			if(typeof cutoff === 'undefined') {
				cutoff = 0;	
			}
			/*if(path.indexOf('[') != -1) {
				prefix = path.substr(0, path.indexOf('[', cutoff.length));
			}*/
			if(path.indexOf('.', cutoff) != -1) {
				var end_index = path.indexOf('.', cutoff);
				prefix = path.substr(0, end_index);
				var statement = "var object = this.root."+prefix+";";	
				eval(statement);
				if(typeof object.init !== 'undefined' && level == 0) {
					return object;	
				} else if(object.init !== 'undefined') {
					return this.find_init_parent(path, level-1, end_index);	
				} else if(object.init === 'undefined' && level > 0) {
					return this.find_init_parent(path, level, end_index);	
				} else {
					return this.root;	
				}
			} else {
				return this.root;	
			}
			/*if(typeof object.parent === 'undefined') {
				return null;	
			}
			if(typeof object.parent.init !== 'undefined') {
				return object.parent;	
			} else {
				return this.find_init_parent(object.parent);	
			}*/
		}
	},
	events: {
		press_enter: function($element, event, keyup) {
			$element.keypress(function(e) {
				if(e.which == 13) {
					event();
				}
			});
			if(typeof keyup !== 'undefined') {
				$element.keyup(function(e) {
					if(e.which == 13) {
						keyup();
					}
				});
			}
		},
		double_click_objects: Array(),
		double_click: function($element, callback) {
			var object = {
				$element: $element,
				callback: callback,
				interlope: 0,
				init: function() {
					var self = this;
					this.$element.click(function() {
						if(self.interlope == 0) {
							self.interlope = 1;	
							setTimeout(function() {
								self.interlope = 0;
							}, 250);
						} else if(self.interlope == 1) {
							self.callback();	
							self.interlope = 0;
						}
					});
				}
			};
			object.init();
			this.double_click_objects.push(object);
		}
	},
	set_app_state: function(prop, val) {
		//Gera Queue
		if(!this.init_in_progress) {	//ekki vista upphafsstillingu, einhvernveginn halda utan um hvenær init er í gangi
			$.post('actions.php', {
				action: 'set_app_state',
				property: prop,
				value: val
			}, function(data) {
			});
		}
	},
	replace_append: function(html, $container, $last_item, set_id, prefix) {
		var id = null;
		if(typeof set_id === 'undefined') {
			id = $(html).attr('id');
		} else {
			id = set_id;	
		}
		
		var $pre = $container.find('#'+id);
		if($pre.length == 0) {
			if($last_item == null) {
				$container.append(html);	
			} else {
				$last_item.after(html);	
			}
		} else {
			var focused = false;
			if($pre.find('textarea').is(':focus') || $pre.find('input').is(':focus')) {
				focused = true;	
			}
			if(!focused) {
				$pre.after(html);
				$pre.remove();	
			}
		}
		/*if(typeof prefix !== 'undefined') {
			id = prefix+'_'+id;
		}*/
		return $container.children().last();
		//return $container.find('#'+id).first();
	},
	clear_removed_items: function(items, $container, id_prefix, li_class) {
		var assoc_data = Array();
		for(var x in data) {
			assoc_data[data[x].id] = data[x];			
		}
		
		$container.find('.'+li_class).each(function() {
			var id = $(this).attr('id');
			var id_split = id.split(id_prefix);
			var id_suffix = id_split[1];
			if(typeof assoc_data[id_suffix] === 'undefined') {
				$(this).remove();	
			}
			
		});
	},
	menu: {
		interlope: 0,
		init_menu_items: function() {
			var branch = this;
			$('.logout_button').click(function() {
				branch.root.login.logout();
			});
		},
		been_initialized: false,
		init: function() {
			var branch = this;
			if(!this.been_initialized) {
				this.init_menu_items();
				$('#menu_first').mouseover(function() {
					$('#user_menu_arrow > .menu_arrow').css('background', '#F7F7F7');
				}).mouseleave(function() {
					$('#user_menu_arrow > .menu_arrow').css('background', '#FFF');
				});
				$('#login_panel').click(function() {
					//console.log(branch.interlope);
					//if(branch.interlope == 0) {
						branch.display();
						branch.interlope = 1;	
					/*} else {
						//branch.hide();
						$('#user_menu_focus').blur();
						branch.interlope = 0;	
					}*/
				});
				$('#user_menu_focus').blur(function() {
					
					setTimeout(function() {
						if(document.activeElement != $('#user_menu_focus')[0]) {
							branch.hide();
						}
					}, 300);
				});
				this.been_initialized = true;
			}
		},
		display: function() {
			var branch = this;
			$('#user_menu').show();
			$('#user_menu_arrow').show();
			branch.interlope = 1;
			if(document.activeElement != $('#user_menu_focus')[0]) {
				$('#user_menu_focus').focus();
			}
		},
		hide: function() {
			var branch = this;
			$('#user_menu').hide();
			$('#user_menu_arrow').hide();
			branch.interlope = 0;	
		}
	},
	login_attempts: 0,
	user_menu: {
		username: null,
		password: null,
		get_username: function() {
			$.post(this.root.actions, {
				action: 'get_username'	
			}, function(data) {
				$('a#user_name.user_name').html(data);
			});
		},
		login_callbacks: Array(),
		init: function(callback) {
			var branch = this;
			$('#body.night').click(function() {
				$('.console').addClass('console_back');
				$('.body_container').removeClass('blur');
				$('#body').animate({
					'opacity': "0"
				}, 700, 'easeOutQuad', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				
				$('.overlay_black').animate({
					'opacity': "0"
				}, 1000, 'easeOutQuad', function() {
					$(this).css({
						'opacity': '0',
						'display': 'none'
					});
				});
			});
			$('#overview_button').click(function() {
				$('.console').removeClass('console_back');
				$('.body_container').addClass('blur');
				$('#body').css({
					'opacity': '1',
					'display': 'block'
				});
				/*$('.app_select').css({
					'opacity': '1',
					'display': 'block'
				});*/
				$('.overlay_black').css({
					'opacity': '0',
					'display': 'block'
				}).animate({
					'opacity': "1"
				}, 900, 'easeInOutQuad', function() { //easeInOutExpo
					
				});
				/*setTimeout(function() {
					$('#body').css({
						'opacity': '0',
						'display': 'block'
					}).	animate({
						'opacity': "1"
					}, 700, 'easeInOutQuint');
				}, 20);*/
			});
			$('.user_button').click(function() {
				$('.console').removeClass('console_back');
				$('.body_container').addClass('blur');
				$('.overlay_black').css({
					'opacity': '0',
					'display': 'block'
				}).animate({
					'opacity': "1"
				}, 700, 'easeInOutQuint', function() {
					
				});
				setTimeout(function() {
					$('.user_options').css({
						'opacity': '0',
						'display': 'block'
					}).	animate({
						'opacity': "1"
					}, 300, 'easeOutQuad');
				}, 100);
			});
			$('.back').click(function() {
				$('.console').addClass('console_back');
				$('.body_container').removeClass('blur');
				$('.user_options').animate({
					'opacity': "0"
				}, 1000, 'easeInOutQuint', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				
				$('.overlay_black').animate({
					'opacity': "0"
				}, 1000, 'easeOutQuad', function() {
					$(this).css({
						'opacity': '0',
						'display': 'none'
					});
				});
			});
			$('.logout').click(function() {
				$.post(branch.root.actions, {
					action: 'logout'	
				}, function(data) {
					branch.root.user_id = "-1";
					if(branch.root.use_rtc) {
						branch.root.ws.close_connection();
					}
					$('.logged_in_options').hide();
					$('.logged_out_options').show();
					$('.user_options').animate({
						'opacity': "0"
					}, 700, 'easeInOutQuint', function() {
						$(this).css({
							'display': 'none'
						});	
					});
					setTimeout(function() {
						$('.login').css({
							'opacity': '0',
							'display': 'block'
						}).animate({
							'opacity': "1"
						}, 1000, 'easeOutExpo');
					}, 300);
				});
			});
			$('.option_title.sign_in_button').click(function() {
				$('.user_options').animate({
						'opacity': "0"
				}, 700, 'easeInOutQuint', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				setTimeout(function() {
					$('.login').css({
						'opacity': '0',
						'display': 'block'
					}).animate({
						'opacity': "1"
					}, 1000, 'easeOutExpo');
				}, 300);
			});
			/*$('.user_options > .account').click(function() {
				window.location.href = '/account';
			});*/
			this.root.events.press_enter($('#username'), function() { $('button.sign_in').click() });
			this.root.events.press_enter($('#password'), function() { $('button.sign_in').click() });
			$('button.sign_in').click(function() {
				branch.username = $('.login #username').val();
				branch.password = $('.login #password').val();
				$.post(branch.root.actions, {
					action: 'login',
					username: $('.login #username').val(),
					password: $('.login #password').val()	
				}, async function(data) {
					if(data != "-1") {
						branch.root.user_id = data;		
						/*branch.root.navigation.recent_hash = "";
						branch.root.navigation.poll_hash();*/
						$('.console').addClass('console_back');
						/*$('.body_container').removeClass('blur');
						$('.login').animate({
							'opacity': "0"
						}, 2500, 'easeOutQuart', function() {
							$(this).css({
								'display': 'none'
							});	
						});
						
						$('.overlay_black').animate({
							'opacity': "0"
						}, 2500, 'easeOutExpo', function() {
							$(this).css({
								'opacity': '0',
								'display': 'none'
							});
						});*/
						if(branch.root.use_rtc) {
							await branch.root.ws.client_login_init();
						} 
						branch.root.navigation.reload_hash();
						branch.remove_login_overlay();
						branch.get_username();
						

						if(typeof callback !== 'undefined') {
							callback();
						}
						for(var x in branch.login_callbacks) {
							branch.login_callbacks[x]();	
						}
						
					} else {
						branch.get_password_attempts();
					}
				});
			});
			$('.sign_up_button').click(function() {
				$('.back').click();
			});
			$('button.learn_more').click(function() {
				document.location.href = '/account/#sign_up';
				branch.remove_login_overlay();
			});
			branch.get_password_attempts();
			$.post(this.root.actions, {
				action: 'get_user_id'	
			}, function(data) {
				branch.root.user_id = data;
				if(typeof branch.root.navigation !== 'undefined') {		
					branch.root.navigation.poll_hash();
				}
				//alert(branch.root.ws.client_id);
				if(data == "-1" || (branch.root.use_rtc && branch.root.ws.client_id == -1)) {
					//$('.logged_in_options').hide();
					//$('.logged_out_options').show();
					if(typeof branch.root.definition.preferences !== 'undefined' && typeof branch.root.definition.preferences.app_login !== ' undefined' && branch.root.definition.preferences.app_login == true || typeof branch.root.definition.prefences === 'undefined' || branch.root.definition.prefences.app_login === 'undefined') {
						
						//alert(branch.root.ws.client_id);
						branch.display_login_overlay();
					}
				} else {	
					if(typeof branch.root.definition.preferences !== 'undefined' && typeof branch.root.definition.preferences.app_login !== ' undefined' && branch.root.definition.preferences.app_login == true) {
						branch.remove_login_overlay();
					}
					if($('.console').length > 0) {
						$('.console').addClass('console_back');
					}
					branch.get_username();	
					if(typeof callback !== 'undefined') {
						callback();
					}
				}		
			});
		},
		get_password_attempts: function() {
			$.post(this.root.actions, {
				'action': 'get_password_attempts'
			}, function(data) {
				if(data > 5) {
					$('.login .login_elements').html("<div>To many incorrect login attempts. You can try to login again in two days.</div>");	
				}
			});
		},
		remove_in_progress: false,
		remove_login_overlay: function() {
			var branch = this;
			if(!this.remove_in_progress) {
				if(branch.root.user_id != -1) {
					$('.logged_in_options').show();
					$('.logged_out_options').hide();
				}
				
				this.remove_in_progress = true;
				if($('.body_container').hasClass('blur')) {
					$('.body_container').removeClass('blur');
					$('.login').animate({
						'opacity': "0"
					}, 800, 'easeOutQuart', function() {
						$(this).css({
							'display': 'none'
						});	
					});
					
					$('.overlay_black').animate({
						'opacity': "0"
					}, 800, 'easeOutExpo', function() {
						$(this).css({
							'opacity': '0',
							'display': 'none'
						});
						branch.remove_in_progress = false;
					});
				}
			}
		},
		display_login_overlay: function() {
			$('.logged_in_options').hide();
			$('.logged_out_options').show();
			$('.body_container').addClass('blur');
			$('.overlay_black').css({
				'display': 'block'
			}).animate({
				'opacity': "1"
			}, 1000, 'easeInOutQuad', function() {
				
			});
			
			$('.login').css({
				'display': 'block',
				'opacity': '0'
			}).animate({
				'opacity': "1"
			}, 1500, 'easeInQuart', function() {
				branch.main_callback_called = false;	
			});
		}
	}
};