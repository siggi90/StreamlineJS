app.interpretation = {
	init: function() {
		//this.render_page(this.root.definition.pages[0], "body");
		//this.display_page("index");
		//this.traverse(this.root.definition);
	},
	traverse: function(definition_element) {
		
	},
	call_on_submit: function(on_submit) {
		var branch = this;
		for(var x in on_submit) {
			var callback_item = on_submit[x];
			var split = callback_item.split("_");
			var type = split[split.length-1]+"s";
			var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
			eval(statement);
			element.operation.load();	
		}	
	},
	loaded_objects: Array(),
	loaded_object: {
		new: function() {
			this.callback = this.parent.callback;
			this.$container = this.parent.$container;
			this.animation = this.parent.animation;
			this.current_page = this.parent.current_page;
			var self = this;
			function loaded_object() {
				self.root.functions.copy_object(this, self);
			}
			self.parent.loaded_objects[this.parent.current_page.id] = new loaded_object();
			//return new loaded_object();
		},
		loaded_callbacks: Array(),
		render_completed_count: 0,
		loaded_count: 0,
		loading_completed: false,
		loaded: function() {
			var branch = this;
			if(!this.loading_completed) {
				this.loaded_count++;
				//alert(this.loaded_count+" - "+this.render_completed_count);
				if(this.loaded_count == this.render_completed_count) {
					/*if(branch.$container.find('.menu_top_container').children().length == 0) {
						branch.$container.find('.menu_top_container').remove();	
					}*/
					var clean_pages = function() {
						branch.$container.parent().children().each(function() {
							if($(this).attr('id') == branch.current_page.id) {
								
							} else {
								$(this).remove();	
							}
						});
					};
					if(branch.animation == false) {
						clean_pages();
						branch.$container.show();	
					} else {
						setTimeout(function() {
							switch(branch.animation) {
								case 'slide':
									branch.$container.css({ 
										'margin-left': '110%',
										'margin-right': '-110%',
										
									});
									branch.$container.show();
									branch.$container.animate({
										'margin-left': '0%',
										'margin-right': '0%'
									}, 750, 'easeOutQuad', clean_pages);
									break;	
							}
						}, 350);
					}
					if(this.callback != null) {
						this.callback();
					}
					for(var x in this.loaded_callbacks) {
						this.loaded_callbacks[x]();	
					}
					//alert('loaded'+branch.current_page.id);
					this.loading_completed = true;
				}
			}
		},
	},
	current_render_frame: null,
	callback: null,
	$container: null,
	current_page: null,
	animation: false,
	bottom_frame: null,
	list_addition_length: 5,
	render_page: function(page, frame, $frame, callback, page_data, animation) {
		var animation = false;
		//alert(poge.id);
		if(page.id != 'search') {
			document.title = page.title;
		}
		this.loaded_callbacks = Array();
		if(this.current_page !== null) {
			if(typeof this.current_page.animation !== 'undefined') {
				//alert(this.current_page.click);
				//alert(page.id);
				if(this.current_page.click == page.id) {
					animation = this.current_page.animation;
					//alert(animation);	
				}
			}
		}
		if(typeof page_data !== 'undefined') {
			if(typeof page_data.title !== 'undefined') {
				document.title = page_data.title;	
			}
		}
		this.animation = animation;
		this.current_page = page;
		if(typeof callback !== 'undefined') {
			this.callback = callback;
		} else {
			this.callback = null;	
		}
		var branch = this;
		var $container;
		if(typeof $frame !== 'undefined') {
			if(page.id == 'article') {
				//$frame.append("testetestest");
			}
			$container = $frame;
			var frame_id = $frame.attr('id').split("_frame")[0];
			this.current_render_frame = this.root.eval_object_path(this.root.find("elements.frames", frame_id), "this");
		} else {
			this.current_render_frame = this.root.eval_object_path(this.root.find("elements.frames", frame), "this");
			$container = $(".body_wrap");
			if(typeof frame !== 'undefined' && frame != 'index') {
				$container = $('.body_wrap #'+frame+'_frame');	
			}
		}
		this.bottom_frame = this.current_render_frame;
		var class_value = "";
		if(typeof page.class !== 'undefined') {
			class_value = page.class;	
		}
		if(animation != false) {
			//alert(animation);
			var $last_page = $container.find('.page').first();
			var width = $last_page.width();
			$last_page.css({
				'position': 'absolute',
				'width': width
			});
			$last_page.animate({
				'margin-left': '-110%',
				//'margin-right': '110%'
			}, 750, 'easeInOutQuint', function() {
				
			});
		}
		if($container.find('#'+page.id).length > 0) {
			$container.find('#'+page.id).remove();	
		}
		var style = "";
		if(this.current_render_frame.level != 0) {
			style = 'display:none;'	
		}
		var icon = "";
		if(typeof page.icon !== 'undefined') {
			var icon_value;
			if(page.icon === true) {
				icon_value = page.title;
			} else {
				icon_value = page.icon;
			}
			icon = "<div class='logo' style='background-image:url(/images/"+icon_value+".png)'></div>";	
		}
		$container.append("<div class='page "+class_value+"' id='"+page.id+"' style='display:none;'>"+icon+"<div class='title' style='"+style+"'>"+page.title+"</div><div class='menu_top_container'></div></div>");
		if(frame == 'body') {
			$container.find('.title').first().show();	
		}
		$container = $container.find('#'+page.id);
		branch.$container = $container;
		this.loaded_object.loaded_count = 0;
		this.loaded_object.render_completed_count = page.content.length;
		this.loaded_object.new();
		var content = page.content;
		for(var x in content) {
			var content_item = content[x];
			(function(content_item){
				var $content_item_element;
				var style_requirment = "";
				if(content_item.requirement_callback !== 'undefined') {
					style_requirment = "display:none;";	
				}
				switch(content_item.type) {
					case 'file_upload':
						$container.append('<form action="upload.php" class="dropzone"></form>');
						//Dropzone.discover();
						var myDropzone = new Dropzone(".dropzone");
						if(typeof content_item.on_submit !== 'undefined') {
							
							myDropzone.on("queuecomplete", function(file) {
								branch.call_on_submit(content_item.on_submit);
							});
							
						}
						branch.loaded_objects[page.id].loaded();
						break;
					case "carousel":
						$container.append("<div class='carousel_wrap'><div class='carousel "+content_item.id+"_carousel' style='height:"+content_item.height+";' id='"+content_item.id+"_carousel'></div><div class='"+content_item.id+"_carousel_bulbs carousel_bulbs'></div></div>");
						var $carousel = $container.find('#'+content_item.id+'_carousel').first();
						var $carousel_bulbs = $container.find('.'+content_item.id+'_carousel_bulbs').first();
						var carousel_object = {
							load: function() {
								var self = this;
								$.post(branch.root.actions, {
									action: content_item.id+"_carousel"	
								}, function(data) {
									for(var i in data) {
										var current_class = '';
										if(i == 0) {
											current_class = "current_slide";	
										}
										var content_wrap = "";
										if(typeof data[i].title !== 'undefined' && data[i].content !== 'undefined') {
											content_wrap = "<div class='carousel_content_wrap'><div class='carousel_text'><div class='title'>"+data[i].title+"</div><div>"+data[i].content+"</div></div></div>";
										}
										$carousel.append("<div class='carousel_item "+current_class+"' style='background-image:url(/images/"+data[i].image+")'>"+content_wrap+"</div>");	
									}
									if(typeof content_item.bulbs !== 'undefined') {
										$carousel.children().each(function(i) {
											if(i > 0) {
												$(this).css('left', '-100%');	
											}
											$carousel_bulbs.append("<div class='bulb' id='bulb_"+i+"'></div>");
											var $bulb = $carousel_bulbs.find('#bulb_'+i);
											//(function(k){
												$bulb.click(function() {
													self.slide_to(i);
												});
											//}(i));
										});
									}
									//self.play();
									//self.slide_to(0);
									var timeout = 0;
									if(typeof content_item.timeout !== 'undefined') {
										timeout = content_item.timeout;	
									}
									//self.current_index = $carousel.children().length-1;
									setTimeout(function() {
										if(typeof content_item.play !== 'undefined') {
											self.play();
										}
									}, timeout+1500);
								}, "json");
							},
							current_index: 0,
							play: function() {
								var self = this;
								var next_slide = this.current_index+1;
								this.slide_to(next_slide, true);
							},
							timeout: null,
							slide_to: function(index, play) {
								var self = this;
								if(typeof play === 'undefined') {
									clearTimeout(self.timeout);	
								}
								if(index >= $carousel.children().length) {
									index = 0;	
								}
								self.current_index = index;
								var $next_slide;
								$carousel.children().each(function(i) {
									if(i == index) {
										$next_slide = $(this);	
									}
								});
								if($next_slide.hasClass('current_slide')) {
									return;	
								}
								$carousel_bulbs.children().each(function(i) {
									if(i == index) {
										var $bulb = $(this);
										$carousel_bulbs.children().each(function() {
											$(this).removeClass('bulb_selected');
										});
										$bulb.addClass('bulb_selected');
									}
								});
								$current_slide = $carousel.find('.current_slide').first();
								if(typeof content_item.animation === 'undefined' || typeof content_item.animation !== 'undefined' && content_item.animation == 'slide') {
									
									$next_slide.css({
										'left': '-100%',
										//'right': '100%'
									});
									$current_slide.animate({
										//'right': '-100%',
										'left': '100%'
									}, 1000, 'easeInOutQuint');	
									$current_slide.removeClass('current_slide');
									
									$next_slide.addClass('current_slide');
									$next_slide.animate({
										'left': '0px',
										//'right': '0px'		
									}, 1000, 'easeInOutQuint', function() {
										if(typeof play !== 'undefined') {
											self.timeout = setTimeout(function() {
												self.play();
											}, content_item.time_interval);
										}
									});
								} else if(content_item.animation == 'fade') {
									$current_slide.fadeOut('slow');
									$next_slide.fadeIn('slow', function() {
										$current_slide.removeClass('current_slide');
										$next_slide.addClass('current_slide');	
										
										if(typeof play !== 'undefined') {
											self.timeout = setTimeout(function() {
												self.play();
											}, content_item.time_interval);
										}
									});	
								}
							}
						};
						carousel_object.load();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'custom_frame':
						var custom_frame_html = $('.custom_frames').find('.'+content_item.link)[0].outerHTML;
						$container.append("<div id='"+content_item.id+"'>"+custom_frame_html+"</div>");
						var page_data_string = "";
						if(typeof page_data_string !== 'undefined') {
							page_data_string = "page_data";	
						}
						var statement = "branch.root."+content_item.id+".init("+page_data_string+")";
						eval(statement);
						branch.loaded_objects[page.id].loaded();
						break;
					case 'link':
						var get_data = {};
						if(typeof content_item.target_page_load_mask !== 'undefined') {
							for(var x in content_item.target_page_load_mask) {
								get_data[content_item.target_page_load_mask[x]] = page_data[x];	
							}
						}
						var href = "";
						if(typeof content_item.manual_link !== 'undefined') {
							href = content_item.manual_link;	
						} else {
							href = branch.root.navigation.generate_href(content_item.target_page, null, null, get_data, content_item.target);
						}
						$container.append("<div class='link' id='"+content_item.id+"_link' style='"+style_requirment+"'><a href='"+href+"'>"+content_item.value+"</a></div>");
						var $link = $container.find('.link#'+content_item.id+"_link").first();
						$content_item_element = $link;
						
						branch.loaded_objects[page.id].loaded();
						break;
					case 'menu':
						//if(!content_item.content.isArray()) {
						var parse_menu = function(fetched) {
							var custom_pages = Array();
							var set_pages = Array();
							if(!fetched) {
								set_pages = content_item.content;	
							} else {
								for(var i in content_item.content) {
									if(typeof content_item.content[i].page === 'undefined') {
										set_pages.push(content_item.content[i].id);	
									} else {
										custom_pages.push(content_item.content[i]);	
									}
								}
							}
							content_item.content_parsed = branch.get_pages_data(set_pages);
							//var content_item_copy = branch.root.functions.copy_object(content_item);
							$container.find('.menu_top_container').first().append("<div class='menu_wrap'><div class='menu_"+content_item.position+" "+content_item.id+"_menu'></div></div>");
							var $menu_container = $container.find('.'+content_item.id+'_menu').first();
							var menu_buttons_html = Array();
							for(var i in content_item.content_parsed) {
								var item = content_item.content_parsed[i];
								$menu_container.append("<div class='menu_button "+item.id+"_button'><a>"+item.title+"</a></div>");	
							}
							
							var content = content_item.content_parsed;
							$menu_container.children().each(function(index) {
								var menu_data = content[index];
								$(this).find('a').first().attr('href', branch.root.navigation.generate_href(menu_data.id, null, null, null, content_item.target));
							});
							
							for(var i in custom_pages) {
								var item = custom_pages[i];
								$menu_container.append("<div class='menu_button "+item.id+"_button'><a>"+item.title+"</a></div>");	
							}
							/*for(var i in menu_buttons_html) {
								alert('append');
								$menu_container.append(menu_buttons_html[i]);	
							}*/
							
							branch.loaded_objects[page.id].loaded();
						};
						if(content_item.content === 'fetch') {
							$.post(branch.root.actions, {
								'action': 'get_menu_'+content_item.id
							}, function(data) {
								content_item.content = data;
								parse_menu(true);
							}, "json");
						} else {
							parse_menu(false);	
						}
						break;
					case 'frame':
						$container.append("<div class='frame' id='"+content_item.id+"_frame'></div>");
						$frame = $container.find('#'+content_item.id+"_frame");
						$content_item_element = $frame;
						var frame_object = {
							$element: $frame,
							parent: branch.current_render_frame,
							level: branch.current_render_frame.level+1,
							__default_page: content_item.default_page	
						};
						var assign_parent = branch.current_render_frame;//this.root.find("elements.frames", frame);
						branch.bottom_frame = frame_object;
						var assign_statement = "assign_parent."+content_item.id+" = frame_object;";
						eval(assign_statement);
						branch.loaded_objects[page.id].loaded();
						break;	
					case 'list':
						$container.append("<div id='"+content_item.id+"_list' class='list'></div>");
						var $list = $container.find('#'+content_item.id+"_list").first();
						$content_item_element = $list;
						var $search;
						if(typeof content_item.title !== 'undefined') {
							$list.append("<div class='title'>"+content_item.title+"</div>");	
						}
						var target_frame = content_item.target;
						var target_frame_object = branch.root.eval_object_path(branch.root.find("elements.frames", target_frame), "this");
						var target_frame_depth = branch.root.depth(target_frame_object, branch.root.elements.frames, 0) - 1;
						$list.append("<div class='list_content'></div>");
						$list.append("<div class='list_load_button'>Load more items</div>");
						var $list_container = $list;
						var $list_load_button = $list_container.find('.list_load_button').first();
						$list = $list.find('.list_content');
						var image_root = "images";
						if(typeof content_item.image_location !== 'undefined') {
							image_root = content_item.image_location;	
						}
						var list_operation = {
							offset: 0,
							$list: $list,
							load: function(search_term) {
								var self = this;
								/*if(typeof no_refresh === 'undefined') {
								}*/
								/*if(typeof no_refresh !== 'undefined') {
									$list = $('.dummy_div').first();	
								} else {
									$list = self.$list;	
								}*/
								if(typeof search_term === 'undefined') {
									search_term = '';	
								}
								$list_values_container = branch.view.dummy_div.new();	//$('.dummy_div').first();
								$list_values_container.html("");	
								var post_data = {
									action: content_item.id+"_list",
									search_term: search_term,
									offset: self.offset	
								};
								if(typeof content_item.post_data !== 'undefined') {
									for(var x in content_item.post_data) {
										
										var statement = "post_data."+x+" = page_data."+content_item.post_data[x];
										eval(statement);	
									}
								}
								$.post(branch.root.actions, post_data, function(data) {
									self.list_data = data;
									//self.offset += data.length;
									var username_target_depth = 1;			
									if(typeof content_item.content !== 'undefined') {					
										if(typeof content_item.content.username.target !== 'undefined') {
											username_target_depth = branch.root.navigation.frames.find_frame_depth(content_item.content.username.target);	
										}
									}
									for(var x in data) {
										var list_item_href = branch.root.navigation.generate_href(content_item.click, target_frame_depth, data[x].id) ;
										var row_item = "<div class='list_item' id='"+data[x].id+"'>";
										if(typeof data[x].title !== 'undefined') {
											row_item += "<div class='title list_element'><a href='"+list_item_href+"'>"+data[x].title+"</a></div>";
											delete data[x].title;
										}
										if(typeof data[x].image !== 'undefined') {
											//row_item += "<div class='list_image' style='background-image:url("+image_root+"/"+data[x].image+")'></div>";	
											row_item += "<a href='"+list_item_href+"'><img src='"+image_root+"/"+data[x].image+"' width='100%' /></a>";
											delete data[x].image;
										}
										if(typeof data[x].content !== 'undefined') {
											row_item += "<div class='content list_element line_clamp' style='padding-bottom: 20px;'>"+data[x].content+"</div>";
											delete data[x].content;
										}
										delete data[x].id;
										/*if(typeof data[x].username !== 'undefined') {
											var user_href = branch.root.navigation.generate_href("user", username_target_depth, data[x].user_id);
											row_item += "<div class='username list_element'><a href='"+user_href+"'>"+data[x].username+"</a></div>";
											delete data[x].username;
											delete data[x].user_id;
										}*/
										if(typeof data[x].username !== 'undefined') {
											
											delete data[x].user_id;
										}
										//row_item += "<div class='list_item_information'>";
										var li_information_count = 0;
										for(var y in data[x]) {
											if(li_information_count > 0) {
												//row_item += "<div class='list_element column_split'>|</div>";	
											}
											//if(y != "title" && y != "content" && y != 'id') {
												row_item += "<div class='list_element_wrap'><div class='caption'>"+y+"</div><div class='"+y+" list_element'>"+data[x][y]+"</div></div>";
												li_information_count++;
											//}
											
										}
										row_item += "</div>";//</div>";
										$list_values_container.append(row_item);
									}
									/*$.post(branch.root.actions, {
										action: content_item.id+"_list_count"	
									}, function(data) {
										if(data == self.offset) {
											$list_load_button.hide();	
										} else {
											$list_load_button.show();	
										}
									});*/
									
									
									if(typeof content_item.date_columns !== 'undefined') {
										for(var c in content_item.date_columns) {
											(function(c) {
												$list_values_container.find('.'+content_item.date_columns[c]).each(function() {
													if(!$(this).parent().hasClass('table_header')) {
														var $this = $(this);
														branch.view.date.date_cell($this);
													}
												});
											}(c));
										}
									}
									
									branch.view.display_changes(self.$list, $list_values_container);
									/*$list_values_container.find('.list_item_information').each(function() {				
										branch.root.interpretation.view.single_row_columns($(this));
									});*/
									
									branch.loaded_objects[page.id].loaded();
								}, "json");
							},
							scroll_call: function() {
								var scroll_point = $list.offset().top + $list.height();
								var scroll_bottom = $(document).scrollTop() + $(window).height();
								if(scroll_bottom > scroll_point-200) {
									//alert(scroll_point);
									this.load(true);	
								}
							}
						};
						list_operation.load();
						
						$list_load_button.click(function() {
							list_operation.offset += branch.list_addition_length;
							list_operation.load();
						});
						var list_object = {
							id: content_item.id,
							$element: $list,
							operation: list_operation	
						};
						branch.root.elements.lists[content_item.id+"_list"] = list_object;
						
						if(typeof content_item.search !== 'undefined') {
							$list.parent().prepend("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
							//if(content_item.search == 'filter') {
								$search = $list.parent().find('.search_bar').find('.search').first();
								$search.keyup(function(e) {
									var search_term = $(this).val().toLowerCase().trim();
									if(search_term != "") {
										/*$list.find('.list_item').each(function() {
											if($(this).text().toLowerCase().indexOf(search_term) != -1) {
												$(this).show();	
											} else {
												$(this).hide();	
											}
										});*/							
										list_operation.load(search_term);
									} else {
										/*$list.find('.list_item').each(function() {
											$(this).show();
										});*/						
										list_operation.load();
									}
								});
							/*} else if(content_item.search == 'search') {
									
							}*/
						}
						
						/*$(window).scroll(function() {
							//alert($(document).scrollTop());
							if(content_item.search !== 'undefined') {
								var search_term = $search.val().toLowerCase().trim();
								if(search_term == "") {
									list_operation.scroll_call();	
								}
							} else {
								list_operation.scroll_call();
							}
						});*/
						break;
					case 'table':
						var is_search_object = false;
						if(typeof content_item.search_object !== 'undefined') {
							is_search_object = true;
							if(typeof content_item.title !== 'undefined') {
								$container.append("<div class='title'>"+content_item.title+"</div>");	
							}
						}
						$container.append("<div><div id='"+content_item.id+"_table' class='table'></div></div>");
						(function($container) {
							var $list = $container.find('#'+content_item.id+"_table").first();
							$content_item_element = $list;
							var $search;
							/*if(typeof content_item.search !== 'undefined') {
								$list.append("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
								if(content_item.search == 'filter') {
									$search = $list.find('.search_bar').find('.search').first();
									$search.keyup(function(e) {
										var search_term = $(this).val().toLowerCase().trim();
										if(search_term != "") {
											$list.find('.list_item').each(function() {
												if($(this).text().toLowerCase().indexOf(search_term) != -1) {
													$(this).show();	
												} else {
													$(this).hide();	
												}
											});
										} else {
											$list.find('.list_item').each(function() {
												$(this).show();
											});
										}
									});
								} else if(content_item.search == 'search') {
										
								}
							}*/
							var content_item_id_singular = content_item.id.substr(0, content_item.id.length-1);
							var form_object;
							if(typeof content_item.target !== 'undefined') {
								form_object = branch.root.elements.find_element_object(content_item.target);
							}
							var list_operation = {
								offset: 0,
								perist_send_data: null,
								$list: $list,
								load: function(send_data, search_string) {
									var self = this;
									//if(typeof no_refresh === 'undefined' && no_refresh != false) {
										//$list.html("");	
									//}
									if(typeof search_string === 'undefined') {
										search_string = '';	
									}
									var $list_values_container = branch.view.dummy_div.new();//= $('.dummy_div').first();
									var post_data = {
										action: content_item.id+"_table",
										search_term: search_string,
										offset: self.offset	
									};
									if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
										for(var x in content_item.post_data) {
											var statement = "post_data."+x+" = page_data."+content_item.post_data[x];
											eval(statement);
										}
									}
									if(typeof send_data === 'undefined') {
										if(this.persist_send_data != null) {
											send_data = this.persist_send_data;	
										}
									}
									if(typeof send_data !== 'undefined') {
										for(var x in send_data) {
											post_data[x] = send_data[x];	
										}
										self.persist_send_data = send_data;
									}
									$.post(branch.root.actions, post_data, function(data) {
										self.list_data = data;
										$list_values_container.html("");	
										self.offset += data.length;
										if(data.length > 0) {
											var x = 0;
											if(typeof data[x].id === 'undefined') {
												content_item.no_id = true;	
											}
										}
										//for(var y in data[x]) {
										if(typeof content_item.no_header === 'undefined') {
											var row_item = "<div class='table_row table_header' id='header'>";
											var li_information_count = 0;
											row_item += "<div class='id table_column' style='display:none;'></div>";
											for(var y in content_item.columns) {
												if(y != 'id') {
													var style = "";
													if(li_information_count == 0) {
														//row_item += "<div class='list_element column_split'>|</div>";	
														style = "border-left:none;";
													}
													row_item += "<div id='"+y+"' class='"+y+" table_column' style='"+style+"'>"+content_item.columns[y]+"</div>";
													li_information_count++;
												}
											}	
													
											if(typeof content_item.edit !== 'undefined') {
												row_item += "<div id='edit_button' class='action table_column' style=''>action</div>";	
											}				
											if(typeof content_item.delete !== 'undefined') {
												row_item += "<div id='delete_button' class='action table_column' style=''>action</div>";	
											}			
											if(typeof content_item.custom_actions !== 'undefined') {
												for(var x in content_item.custom_actions) {
													row_item += "<div id='custom_action' class='custom_action table_column' style=''>action</div>";
												}
											}
											row_item += "</div></div>";	
											$list_values_container.append(row_item);				
										}
										for(var x in data) {
											//function(
											if(typeof data[x].id === 'undefined') {
												data[x].id = x;	
											}
											var row_item = "<div class='table_row' id='"+data[x].id+"'>";
											var li_information_count = 0;
											row_item += "<div id='id' class='id table_column' style='display:none;'>"+data[x].id+"</div>";
											for(var y in data[x]) {
												if(y != 'id') {
													var style = "";
													var class_value = 'table_column';
													if(li_information_count == 0) {
														//row_item += "<div class='list_element column_split'>|</div>";	
														style = "border-left:none;";
													}
													/*if(typeof content_item.column_mask !== 'undefined') {
														if(typeof content_item.column_mask[y] !== 'undefined' && content_item.column_mask[y] == 'hidden') {
															style += "display:none;";	
														}
													}*/
													if(typeof content_item.columns[y] === 'undefined') {
														style += "display:none;";	
														class_value = 'table_column_hidden';
													}
													var column_value = "";
													if(typeof content_item.content !== 'undefined' && typeof content_item.content[y] !== 'undefined') {
														if(content_item.content[y] == 'image') {
															column_value = data[x][y]+".png";
															row_item += "<div id='"+y+"' class='"+y+" "+class_value+" table_column_image' style='"+style+" background-image:url(\"/images/"+column_value+"\");'>"+"</div>";	
														}
													} else {
														column_value = data[x][y];
														if(y == 'bulletin') {
															column_value = "<i class='icofont-ui-press' style='color:hsl("+column_value+")'></i>";	
														}
														row_item += "<div id='"+y+"' class='"+y+" "+class_value+"' style='"+style+"'>"+column_value+"</div>";
													}
													li_information_count++;
												}
											}
											row_item += "</div></div>";
											$list_values_container.append(row_item);
											var $row = $list_values_container.find('.table_row#'+data[x].id).first();
											if(typeof content_item.on_click !== 'undefined') {
												var get_data = {
													id: data[x].id
												};
												var href = branch.root.navigation.generate_href(content_item.on_click, null, null, get_data, content_item.target_frame); 
												$row.find('.table_column').each(function() {
													if(!$(this).hasClass('table_column_image')) {
														var text = $(this).text();
														var link_replacement = "<a href='"+href+"'>"+text+"</a>";
														$(this).html(link_replacement);	
													}
												});
											}
											if(typeof data[x].href !== 'undefined') {
												var href = data[x].href;
												$row.find('.table_column').each(function() {
													if(!$(this).hasClass('table_column_image')) {
														var text = $(this).text();
														var link_replacement = "<a href='"+href+"'>"+text+"</a>";
														$(this).html(link_replacement);	
													}
												});	
											}
											if(typeof content_item.edit !== 'undefined') {
												$row.append("<div id='edit_button' class='edit_button table_column'>Edit</div>");
												(function(data){
													$row.find('.edit_button').click(function() {
														if(data.id !== 'undefined') {
															$.post(branch.root.actions, {
																action: 'get_'+content_item_id_singular,
																id: data.id	
															}, function(data) {
																form_object.operation.load(data);
															}, "json");
														} else {
															form_object.operation.load(data);
														}
													});
												}(data[x]));
											}
											if(typeof content_item.delete !== 'undefined') {
												$row.append("<div id='delete_button' class='delete_button table_column'>Delete</div>");	
												(function(data){
													$row.find('.delete_button').click(function() {
														var post_data = {
															action: 'delete_'+content_item_id_singular
														};
														if(typeof content_item.no_id !== 'undefined') {
															for(var x in data) {
																post_data[x] = data[x];	
															}
														} else {
															post_data.id = data.id;	
														}
														$.post(branch.root.actions, post_data, function(data) {
															self.load();
														});
													});
												}(data[x]));
											}
											if(typeof content_item.custom_actions !== 'undefined') {
												(function(data){
													for(var action_name in content_item.custom_actions) {
														var href = "";
														if(typeof content_item.custom_actions[action_name].target_href !== 'undefined') {
															var send_data = {};
															for(var i in content_item.custom_actions[action_name].href_data) {
																var href_data_index = content_item.custom_actions[action_name].href_data[i];
																send_data[i] = data[href_data_index];	
															}
															href = branch.root.navigation.navigate_to(content_item.custom_actions[action_name].target_href, send_data, true);
														}
														if(href == "") {
															$row.append("<div id='custom_action' class='custom_action table_column'>"+action_name+"</div>");
														} else {
															$row.append("<div id='custom_action' class='custom_action table_column'><a href='"+href+"'>"+action_name+"</a></div>");	
														}
														/*$row.find('.delete_button').click(function() {
															var post_data = {
																action: 'delete_'+content_item_id_singular
															};
															if(typeof content_item.no_id !== 'undefined') {
																for(var x in data) {
																	post_data[x] = data[x];	
																}
															} else {
																post_data.id = data.id;	
															}
															$.post(branch.root.actions, post_data, function(data) {
																self.load();
															});
														});*/
													}
												}(data[x]));
											}
										}
											
										if(typeof content_item.date_columns !== 'undefined') {
											for(var c in content_item.date_columns) {
												(function(c) {
													$list_values_container.find('.'+content_item.date_columns[c]).each(function() {
														if(!$(this).parent().hasClass('table_header')) {
															var $this = $(this);
															branch.view.date.date_cell($this);
														}
													});
												}(c));
											}
										}
										if(typeof content_item.column_width !== 'undefined') {
											//for(var w in content_item.column_width) {
											$list_values_container.find('.table_row').each(function() {
												//alert($(this).attr('id'));
												$(this).children().each(function() {
													var index = $(this).attr('id');
													//alert(index);
													//alert($(this).html());
													//alert(content_item.column_width[index]);
													$(this).css('width', content_item.column_width[index]);
												});
											});
										} else {
											/*$list_values_container.find('.table_row').each(function() {				
												branch.root.interpretation.view.single_row_columns($(this), true);
											});*/
										}
										//branch.root.interpretation.view.single_row_columns($list_values_container.find('.table_row'), true);
										
										
										branch.view.display_changes(self.$list, $list_values_container);
										
										branch.loaded_objects[page.id].loaded();
									}, "json"); //
								},
								scroll_call: function() {
									/*var scroll_point = $list.offset().top + $list.height();
									var scroll_bottom = $(document).scrollTop() + $(window).height();
									if(scroll_bottom > scroll_point-200) {
										//alert(scroll_point);
										this.load(true);	
									}*/
								}
							};
							if(typeof content_item.search !== 'undefined' && typeof content_item.search_object === 'undefined') {
								$list.parent().prepend("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
								//if(content_item.search == 'filter') {
									$search = $list.parent().find('.search_bar').find('.search').first();
									$search.keyup(function(e) {
										var search_term = $(this).val().toLowerCase().trim();
										if(search_term != "") {
											if(content_item.search == 'filter') {
												$list.find('.list_item').each(function() {
													if($(this).text().toLowerCase().indexOf(search_term) != -1) {
														$(this).show();	
													} else {
														$(this).hide();	
													}
												});
											} else {
												list_operation.load(null, search_term);
											}
										} else {
											if(content_item.search == 'filter') {
												$list.find('.list_item').each(function() {
													$(this).show();
												});	
											} else {
												list_operation.load();
											}
										}
									});
							}
							if(typeof content_item.require_foreign_id === 'undefined') {
								list_operation.load();
							} else {
								branch.loaded_objects[page.id].loaded();
							}
							/*$(window).scroll(function() {
								//alert($(document).scrollTop());
								if(content_item.search !== 'undefined') {
									var search_term = $search.val().toLowerCase().trim();
									if(search_term == "") {
										list_operation.scroll_call();	
									}
								} else {
									list_operation.scroll_call();
								}
							});*/
							var table_object = {
								id: content_item.id,
								$element: $list,
								operation: list_operation
							};
							
							if(!is_search_object) {
								branch.root.elements.tables[content_item.id+"_table"] = table_object;
							} else {
								branch.root.elements.search_elements[content_item.id+"_table"] = table_object;
							}
						}($container));
						break;
					case 'form':
						(function(content_item) {
							$container.append("<div id='"+content_item.id+"_form' class='form'></div>");
							var $form = $container.find('#'+content_item.id+'_form');
							$content_item_element = $form;
							if(typeof content_item.no_primary_id === 'undefined') {
								$form.append("<input type='hidden' id='id' class='id form_input optional_field' value='-1' />");
							}
							if(typeof content_item.title !== 'undefined') {
								$form.append("<div class='title'>"+content_item.title+"</div>");
							}//
							var form_object = {
								$element: $form,
								operation: {
									elements: Array(),
									load: function(data) {
										var self = this;
										$form.find('.form_input').each(function() {
											if(!$(this).hasClass('ignore_reset')) {
												$(this).val("");
											}
										});
										$form.find('input[type=hidden]').each(function() {
											if(!$(this).hasClass('ignore_reset')) {
												$(this).val("-1");
											}
										});
										if(typeof data !== 'undefined') {
											for(var x in data) {
												self.root.$element.find('#'+x).val(data[x]);	
											}
										}
										
										if(typeof data === 'undefined') {
											for(var x in this.elements) {
												this.elements[x].operation.load();		
											}
										}
										if(typeof data === 'undefined') {
											data = {
												
											}
											self.root.$element.find('.form_input').each(function() {
												var id = $(this).attr('id');
												data[id] = $(this).val();
											});
										}
										for(var x in content_item.on_load) {
											var callback_item_reference = content_item.on_load[x];
											var callback_object = branch.root.elements.find_element_object(callback_item_reference);
											var send_data = {
												//id: data.id	
											};
											if(typeof content_item.on_load_load_mask !== 'undefined') {
												for(var x in content_item.on_load_load_mask) {
													send_data[content_item.on_load_load_mask[x]] = data[x];		
												}
											}
											callback_object.operation.load(send_data);
										}
										
										this.conditionals();
									},
									condition_valid: true,
									condition_validation: Array(),
									conditionals: function() {
										var self = this;
										for(var y in content_item.content) {
											var form_item = content_item.content[y];
											var $form_element = $form.find('#'+form_item.id);
											if(typeof form_item.conditions !== 'undefined') {
												//alert('conditionals');
												//alert(form_item.conditions.length);
												self.condition_validation[form_item.id] = Array();
												for(var x in form_item.conditions) {
													var condition_object = form_item.conditions[x];
													
													self.condition_validation[form_item.id][condition_object] = true;
													
													var $element = $form.find('#'+condition_object).first();
													
													//alert('#'+condition_object);
													//alert('value condition object: '+$element.val());
													if($element.val().trim() == "" || $element.val() == "-1") {
														self.condition_validation[form_item.id][condition_object] = false;
													}
													$element.change(function() {
														//alert("changed: "+$(this).val());
														if($(this).val().trim() == "" || $(this).val() == "-1") {
															self.condition_validation[form_item.id][condition_object] = false;
														} else {
															self.condition_validation[form_item.id][condition_object] = true;	
														}
														var condition_valid = true;
														for(var k in self.condition_validation[form_item.id]) {
															if(!self.condition_validation[form_item.id][k]) {
																condition_valid = false;	
															}
														}
														if(condition_valid) {
															$form_element.removeAttr('disabled');	
														} else {
															$form_element.prop('disabled', 'true');	
														}
													});
													$element.trigger('change');
												}
												/*(function($form_element) {
													self.watch("condition_valid", function(obj, old_value, new_value) {
														//alert('watch changed');
														//alert("old: "+old_value);
														//alert("new: "+new_value);
														if(!new_value) {
															$form_element.prop('disabled', 'true');	
														} else {
															$form_element.removeAttr('disabled');	
														}
													});
												}($form_element));*/
											}
										}
									}
								}
							};
							var form_elements = content_item.content;
							for(var x in form_elements) {
								var form_element = form_elements[x];
								var $input;
								var $input_extra;
								(function(form_element, form_object) {
									switch(form_element.type) {
										case 'date':
											$form.append("<div class='form_element'><input type='date' id='"+form_element.id+"' class='form_input' value='' /></div>");
											break;
										case 'radio':
											var append_value = "<div class='form_element flex'><div class='radio_buttons form_input' id='"+form_element.id+"'>";
											var counter = 0;
											for(var z in form_element.content) {
												var checked = "";
												if(counter == 0) {
													checked = "checked='checked'";	
												}
												append_value += "<div class='radio_container'><input type='radio' name='"+form_element.id+"' class='' id='"+form_element.id+"' value='"+z+"' "+checked+" />"+form_element.content[z]+"</div>";	
												counter++;
											}
											append_value += "</div></div>";
											$form.append(append_value);
											var $radio = $form.find('#'+form_element.id).first();
											$input = $radio;
											break;
										case 'hidden':
											$form.append("<div class='form_hidden'><input type='hidden' id='"+form_element.id+"' class='form_input' value='-1' /></div>");
											MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
											var trackChange = function(element) {
												var observer = new MutationObserver(function(mutations, observer) {
													if(mutations[0].attributeName == "value") {
														$(element).trigger("change");
													}
												});
												observer.observe(element, {
													attributes: true
												});
											}
											var $hidden = $form.find('input#'+form_element.id).first();
											trackChange($hidden[0]);
											$input = $hidden;
											break;
										case 'text':
											$form.append("<div class='form_element'><input type='text' id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											
											break;
										case 'password':
											$form.append("<div class='form_element'><input type='password' maxlength='20' id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											
											var $form_password = $form.find('#'+form_element.id).first();
											$input = $form_password;
											
											if(typeof form_element.no_confirmation === 'undefined') {
												$form.append("<div class='form_element'><input type='password' maxlength='20' id='"+form_element.id+"_confirm' class='form_input pseudo_value' placeholder='"+form_element.placeholder+" (confirm)' /></div>");
												var $form_confirmation = $form.find('#'+form_element.id+'_confirm').first();
												$input_extra = $form_confirmation;
												$form_confirmation.keyup(function() {
													var value = $(this).val();
													if(value != $form_password.val()) {
														$(this).addClass('invalid');	
													} else {
														$(this).removeClass('invalid');	
													}
												});
											}
											break;
										case 'textarea':
											$form.append("<div class='form_element'><textarea id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"'></textarea></div>");
											var $textarea = $form.find('#'+form_element.id).first();
											$input = $textarea;
											break;
										case 'tags':
											$form.append("<div class='form_element'><input type='text' id='"+form_element.id+"' class='form_input tags_input' placeholder='"+form_element.placeholder+"' /></div>");
											$form.append("<div class='form_element tags_container' id='"+form_element.id+"_container'></div>");
											break;
										case 'select':
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<div class='form_element_caption'>";
												caption += form_element.caption;
												caption += "</div>";
											}	
											$form.append("<div class='form_element'>"+caption+"<select id='"+form_element.id+"_id' class='form_input'></select></div>");
											var $select = $form.find('select#'+form_element.id+"_id").first();
											var select_object = {
												$element: $select,
												operation: {
													/*load: function() {
														
													}*/
													init: function() {
														var self = this;
														this.parent.$element.change(function() {
															self.last_value = $(this).val();
														});
													}
												}
											}
											if(form_element.content == 'fetch') {
												(function(form_element, select_object, $select){
													select_object.operation.load = function() {
														var self = this;
														$.post(branch.root.actions, {
															action: 'get_'+form_element.id+'_select'	
														}, function(data) {
															$select.html("");
															for(var x in data) {
																var option = "<option value='"+data[x].id+"'>"+data[x].title+"</option>";	
																$select.append(option);
															}
															if(typeof form_element.persist_value !== 'undefined' && form_element.persist_value == true) {
																if(self.last_value !== 'undefined') {
																	$select.val(self.last_value);	
																}
															}
														}, "json");
													};
												}(form_element, select_object, $select));
												//select_object.operation.load();
											}
											branch.root.assign_root_object(select_object);
											select_object.operation.init();
											form_object.operation.elements[form_element.id] = select_object;
											$input = $select;
											break;
										case 'suggest':
											$form.append("<div class='form_element'><input type='hidden' id='"+form_element.id+"_value' class='form_input' value='-1' /><input type='text' id='"+form_element.id+"'  autocomplete='off' class='form_input form_suggest ' placeholder='"+form_element.placeholder+"' /></div><div class='suggestion_results' id='"+form_element.id+"_results'></div>");
											var $suggest = $form.find('#'+form_element.id).first();
											var $suggest_value = $form.find('#'+form_element.id+"_value").first();
											var $suggestion_results = $form.find('#'+form_element.id+"_results").first();
											var suggest_object = {
												$element: $suggest,
												operation: {
													load: function() {
														
													},
													init: function() {
														if(form_element.require_id !== 'undefined') {
															$suggest.focusout(function() {
																if($suggest_value.val() == "-1") {
																	$.post(branch.root.actions, {
																		action: 'get_'+form_element.id+'_suggest_validation',
																		search_term: $suggest.val()		
																	}, function(data) {
																		if(typeof data.id !== 'undefined') {
																			$suggest_value.val(data.id);
																			$suggestion_results.hide('fast', function() {
																				$suggestion_results.html("");
																			});
																		} else {
																			$suggest.addClass('invalid');	
																		}
																	}, "json");
																}
															});
														}
														$suggest.focus(function() {
															$suggest.removeClass('invalid');
														});
														$suggest.keyup(function() {
															var value = $(this).val();
															$suggest_value.val("-1");
															$.post(branch.root.actions, {
																action: 'get_'+form_element.id+'_suggest',
																search_term: value	
															}, function(data) {
																$suggestion_results.html("");
																$suggestion_results.show();
																for(var x in data) {
																	(function(data) {
																		$suggestion_results.append("<div id='"+data.id+"'>"+data.value+"</div>");	
																		$suggestion_results.find('#'+data.id).click(function() {
																			$suggest.val(data.value);
																			$suggest_value.val(data.id);
																			$suggest.removeClass('invalid');
																			$suggestion_results.hide('fast', function() {
																				$suggestion_results.html("");
																			});
																		});
																	}(data[x]));
																}
															}, "json");
														});
													}
												}
											};
											suggest_object.operation.init();
											form_object.operation.elements[form_element.id] = suggest_object;
											$input = $suggest;
											break;
										default:
											var statement = "branch.root.custom_elements."+form_object.type+".init(form_element, $container, page_data)";
											eval(statement);
											break;
									}
									if(typeof form_element.validation !== 'undefined') {
										$input.change(function() {
											var $this = $(this);
											//if($form.find('#id').val() != "-1") {
												$.post(branch.root.actions, {
													action: form_element.id+'_validation',
													value: $(this).val(),
													id: $form.find('#id').val()
												}, function(data) {
													if(data) {
														$this.removeClass('invalid');	
													} else {
														$this.addClass('invalid');
													}
												});
											//}
										});
									}
									if(typeof form_element.ignore_reset !== 'undefined' && form_element.ignore_reset == true) {
										$input.addClass('ignore_reset');	
									}
									if(typeof form_element.required_on_edit !== 'undefined' && form_element.required_on_edit == false) {
										$input.addClass('unrequired_on_edit');
										if(typeof $input_extra !== 'undefined') {
											$input_extra.addClass('unrequired_on_edit');
										}
									}
									if(typeof form_element.dependencies !== 'undefined') {
										var dependency_callback = function(dependencies, $input) {
											return function() {
												for(var z in dependencies) {
													var dependency = dependencies[z];
													var link = dependency.link;
													link = link.split(".");
													var form = link[0];
													var form_element = link[1];
													var form_object = branch.root.elements.forms[form];
													var $linked_form = form_object.$element;
													var $linked_element = $linked_form.find('#'+form_element).first();
													$linked_element.change(function() {
														var linked_value;
														if($(this).hasClass('radio_buttons')) {
															linked_value = $(this).find('input[type=radio]:checked').val();	
														} else {
															linked_value = $(this).val();
														}
														if(linked_value == dependency.value) {
															$input.addClass('ignore_value');
															$input.parent().show();	
														} else {
															$input.removeClass('ignore_value');
															$input.parent().hide();	
														}
													}).trigger('change');
												}
											};
										}(form_element.dependencies, $input);
										branch.loaded_objects[page.id].loaded_callbacks.push(dependency_callback);
									}
								}(form_element, form_object));
							}
							$form.append("<div class='form_buttons'></div>");
							var $form_buttons = $form.find('.form_buttons').first();
							if(typeof content_item.save !== 'undefined') {
								var text_value = "Save";
								if(content_item.save !== true) {
									text_value = content_item.save;
								}
								$form_buttons.append("<button class='save'>"+text_value+"</button>");
								$form_buttons.find('button.save').click(function() {
									var submit_data = {
										action: "_"+content_item.id	
									};
									var valid = true;
									var id_set = false;
									if($form.find('#id').val() != "-1") {
										id_set = true;	
									}
									$form.find('.form_input').each(function() {
										//if(this.tagName == 'input' && this.type == 'radio') {
										if($(this).hasClass('radio_buttons')) {
											
										} else {
											if($(this).hasClass('invalid')) {
												valid = false;	
											}
											if(($(this).val() == "" || $(this).val() == "-1") && !$(this).hasClass('optional_field') && !(id_set && $(this).hasClass('unrequired_on_edit'))) {												
												valid = false;	
											}
										}
									});
									if(!valid) {
										branch.view.pop_up.display("Form is not valid, please fix invalid fields.", "fadeout");
										return false;
									}
									$form.find('.form_input').each(function() {
										if(!$(this).hasClass('pseudo_value') && !$(this).hasClass('ignore_value') && !($(this).hasClass('unrequired_on_edit') && $(this).val() == "")) {
											var id = $(this).attr('id');
											/*if(this.tagName.toLowerCase() == 'select') {
												id += "_id";	
											}*/
											var value;
											if($(this).hasClass('radio_buttons')) {
												value = $(this).find('input[type=radio]:checked').val();	
											} else {
												value = $(this).val();
											}
											var statement = "submit_data."+id+" = value;";
											eval(statement);
										}
									});
									$.post(branch.root.actions, submit_data, function(data) {
										$form.find('#id').first().val(data);
										if(data == -1) {
											form_object.operation.load();
										}
										if(typeof content_item.target_page !== 'undefined') {
											var send_data = {};
											/*if(typeof content_item.target_page_load_mask !== 'undefined') {
												for(var x in content_item.target_page_load_mask) {
													send_data[content_item.target_page_load_mask[x]] = data[x];
												}
											}*/
											send_data.id = data;
											/*var target_page = branch.find_page(content_item.target_page);
											branch.render_page(target_page, 'main', null, function() {
												
											}, send_data);*/
											branch.root.navigation.navigate_to(content_item.target_page, send_data);
										}
										for(var x in content_item.on_submit) {
											var callback_item = content_item.on_submit[x];
											var split = callback_item.split("_");
											var type = split[split.length-1]+"s";
											var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
											eval(statement);
											element.operation.load();	
										}
										if(typeof content_item.new_on_save !== 'undefined') {
											form_object.operation.load();	
										}
										/*if(content_item.id == 'user') {
											if(data != "-1") {
												branch.root.user_id = data;	
											}
										}*/
										if(typeof content_item.redirect !== 'undefined') {
											document.location.href = content_item.redirect;
										}
									});
								});
							}
							if(typeof content_item.new !== 'undefined') {
								$form_buttons.append("<button class='new'>New</button>");
								$form_buttons.find('button.new').first().click(function() {
									/*$form.find('.form_input').each(function() {
										$(this).val("");
									});
									$form.find('input[type=hidden]').val("-1");*/
									form_object.operation.load();
								});
							}
							if(typeof content_item.delete !== 'undefined') {
								$form_buttons.append("<button class='delete'>Delete</button>");
								$form_buttons.find('button.delete').first().click(function() {
									var post_data = {
										action: 'delete_'+content_item.id,
										id: $form.find('#id').first().val()
									};
									$.post(branch.root.actions, post_data, function(data) {
										if(typeof content_item.on_delete_navigate !== 'undefined') {
											branch.root.navigation.navigate_to(content_item.on_delete_navigate);
										}
									});
								});
							}
							branch.root.assign_root_object(form_object);
							branch.root.elements.forms[content_item.id+"_form"] = form_object;
							branch.loaded_objects[page.id].loaded_callbacks.push(function() {
								form_object.operation.load();
								if(typeof content_item.get_load_mask !== 'undefined') {
									for(var x in content_item.get_load_mask) {
										$form.find('#'+content_item.get_load_mask[x]).val(page_data[x]);	
									}
								}
							});
							//form_object.operation.load();
							branch.loaded_objects[page.id].loaded();
						}(content_item));
						break;
					case 'title':
						var id = content_item.id;
						var value;
						if(typeof content_item.value !== 'undefined') {
							value = content_item.value;	
						} else {
							var statement = "value = page_data."+id+";";
							eval(statement);
						}
						$container.append("<div class='title' id='"+content_item.id+"'>"+value+"</div>");
						$content_item_element = $container.find('.title#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'date':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						var class_value = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						$container.append("<div class='date "+class_value+"' id='"+content_item.id+"'>"+caption+"<div class='date_value_wrap'>"+value+"</div></div>");
						$content_item_element = $container.find('.date#'+content_item.id).first();
						branch.view.date.date_cell($content_item_element.find('.date_value_wrap').first());
						branch.loaded_objects[page.id].loaded();
						break;
					case 'information':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						var class_value = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						$container.append("<div class='article_information "+class_value+"' id='"+content_item.id+"'>"+caption+value+"</div>");
						$content_item_element = $container.find('.article_information#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'user':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						var class_value = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						$container.append("<div class='user "+class_value+"' id='"+content_item.id+"'>"+caption+value+"</div>");
						$content_item_element = $container.find('.user#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'content':
						var id = content_item.id;
						var value;
						if(typeof content_item.content !== 'undefined') {
							value = content_item.content;
						} else {
							var statement = "value = page_data."+id+";";
							eval(statement);
						}
						$container.append("<div class='content' id='"+content_item.id+"'>"+value+"</div>");
						$content_item_element = $container.find('.content#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'discussion':
						$container.append("<div class='discussion' id='"+content_item.id+"'><div class='discussion_content'></div><div class='comment'><textarea class='comment_value' placeholder='Type comment here and press Enter to send'></textarea></div></div>");
						var $discussion = $container.find('.discussion#'+content_item.id).first();
						var $comment_object = $discussion.find('.comment_value');
						var discussion_object = {
							$element: $discussion,
							operation: {
								parent_id: "-1",
								load: function() {
									var self = this;
									var post_data = {
										action: 'get_discussion'
									};
									for(var z in content_item.load_mask) {
										if(content_item.load_mask[z].indexOf('.') != -1) {
											var statement = "var value = "+content_item.load_mask[z]+";";
											eval(statement);
											post_data[z] = value;	
										} else {
											post_data[z] = page_data[content_item.load_mask[z]];	
										}
									}	
									$.post(branch.root.actions, post_data, function(data) {
										$discussion.find('.discussion_content').first().html("");
										self.parse(data, $discussion.find('.discussion_content').first());
									}, "json"); // "json"								
									branch.loaded_objects[page.id].loaded();
								},
								parse: function(data, $parent_object) {
									var self = this;
									for(var x in data) {
										(function(data_value) {
											$parent_object.append("<div class='discussion_comment' id='"+data_value.id+"'><div class='username'>"+data_value.email+":<div class='reply_button'>reply</div></div><div>"+data_value.content+"</div></div>");
											var $comment = $parent_object.find('.discussion_comment#'+data_value.id).first();
											$comment.find('.reply_button').click(function() {
												self.parent_id = data_value.id;
												$comment_object.focus();
											});
											self.parse(data_value.children, $comment);
										}(data[x]));
									}
								}
							}
						};
						/*$discussion.find('.comment').keyup(function(e) {
							 
						});*/
						branch.root.events.press_enter($comment_object, function() {
							$.post(branch.root.actions, {
								action: '_make_comment',
								content: $comment_object.val(),
								reference_id: page_data.id,
								reference_type: page.id,
								parent_id: discussion_object.operation.parent_id
							}, function(data) {
								//alert(data);
							});
						}, function() {
							$comment_object.val("");
							discussion_object.operation.load();
							discussion_object.operation.parent_id = -1;	
						});
						discussion_object.operation.load();
						break;
					default:
						var statement = "branch.root.custom_elements."+form_object.type+".init(content_item, $container, page_data)";
						eval(statement);
						break;
					/*case 'tags':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
						}
						$container.append("<div class='tags' id='"+content_item.id+"'>"+caption+value+"</div>");
						$content_item_element = $container.find('.title#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;*/
				}
				if(typeof content_item.requirement_callback !== 'undefined') { // && typeof $content_item_element !== 'undefined'
					var post_data = {
						action: content_item.requirement_callback	
					};
					
					for(var x in content_item.requirement_data_mask) {
						post_data[content_item.requirement_data_mask[x]] = page_data[x];
					}
					$.post(branch.root.actions, post_data, function(data) {
						if(data == 1) {
							$content_item_element.show();	
						} else {
							$content_item_element.hide();	
						}
					});
				}
				if(typeof content_item.dependencies !== 'undefined') {
					var dependency_callback = function(dependencies, $input) {
						return function() {
							for(var z in dependencies) {
								var dependency = dependencies[z];
								var link = dependency.link;
								link = link.split(".");
								var form = link[0];
								var form_element = link[1];
								var form_object = branch.root.elements.forms[form];
								var $linked_form = form_object.$element;
								var $linked_element = $linked_form.find('#'+form_element).first();
								$linked_element.change(function() {
									var linked_value;
									if($(this).hasClass('radio_buttons')) {
										linked_value = $(this).find('input[type=radio]:checked').val();	
									} else {
										linked_value = $(this).val();
									}
									if(linked_value == dependency.value) {
										$input.show();	
									} else {
										$input.hide();	
									}
								}).trigger('change');
							}
						};
					}(content_item.dependencies, $content_item_element);
					branch.loaded_objects[page.id].loaded_callbacks.push(dependency_callback);
				}
			}(content_item));
		}
	},
	display_page: function(id) {
		var pages = this.root.definition.pages;
		/*for(var x in pages) {
			if(id == pages[x].id) {
				document.title = pages[x].title;	
			}
		}*/
		var page_object = this.find_page(id);
		document.title = page_object.title;
	},
	get_pages_data: function(page_ids) {
		var pages = this.root.definition.pages;
		var result = Array();
		for(var y in page_ids) {
			var id = page_ids[y];
			for(var x in pages) {
				if(id == pages[x].id) {
					result.push(pages[x]);	
				}
			}
		}
		return result;
	},
	find_page: function(page_id) {
		return this.get_pages_data(Array(page_id))[0];	
	},
	apply_load_mask: function(post_data, load_mask, page_data, page) {
		for(var z in load_mask) {
			if(load_mask[z].indexOf('.') != -1) {
				var statement = "var value = "+load_mask[z]+";";
				eval(statement);
				post_data[z] = value;	
			} else {
				post_data[z] = page_data[load_mask[z]];	
			}
		}	
	},
	view: {
		textarea: {
			call_resize: function($textarea) {
				var text = $textarea[0];//document.getElementById('text');
				text.style.height = 'auto';
				text.style.height = text.scrollHeight+'px';
			
			},
			init: function($textarea) {
				var branch = this;
				var observe;
				if (window.attachEvent) {
					observe = function (element, event, handler) {
						element.attachEvent('on'+event, handler);
					};
				} else {
					observe = function (element, event, handler) {
						element.addEventListener(event, handler, false);
					};
				}
				function init() {
					var text = $textarea[0];//document.getElementById('text');
					function resize () {
						text.style.height = 'auto';
						text.style.height = text.scrollHeight+'px';
					}
					/* 0-timeout to get the already changed text */
					function delayedResize () {
						window.setTimeout(resize, 0);
					}
					observe(text, 'change',  resize);
					observe(text, 'cut',     delayedResize);
					observe(text, 'paste',   delayedResize);
					observe(text, 'drop',    delayedResize);
					observe(text, 'keydown', delayedResize);
				
					text.focus();
					text.select();
					resize();
				}
				init();
			}
		},
		dummy_div: {
			current_id: 0,
			new: function() {
				this.current_id++;
				$('.dummy_div').first().append("<div id='dummy_"+this.current_id+"'></div>");
				var $dummy_div = $('.dummy_div').find('#dummy_'+this.current_id).first();
				return $dummy_div;
			},
			garbage_collection: function($dummy_div) {
				var id = $dummy_div.attr('id');
				var id = id.split("_")[1];
				$dummy_div.remove();
			}
		},
		disappear_count: 0,
		display_changes: function($container, $dummy_div) {
			var self = this;
						
			this.disappear_count = 0;
			var container_ids = [];
			var new_ids = [];
			$container.children().each(function() {
				var id = $(this).attr('id');
				container_ids[id] = true;//container_ids.push(id);
			});
			$dummy_div.children().each(function() {
				var id = $(this).attr('id');
				new_ids[id] = true;
				//new_ids.push(id);
			});
			
			var disappear = [];
			var appear = [];
			for(var x in container_ids) {
				if(typeof new_ids[x] === 'undefined') {
					disappear.push(x);	
				}
			}
			for(var x in new_ids) {
				if(typeof container_ids[x] === 'undefined') {
					appear.push(x);	
				}
			}
			var appear_callback = function() {
				for(var z in appear) {
					$dummy_div.find('#'+appear[z]).css('display', 'none');//hide();	 //addClass('hidden');
					//alert(x);
				}
				$container.html("");
				$dummy_div.children().each(function() {
					$(this).clone(true).appendTo($container);
				});
				//$container.html($dummy_div.html());
				setTimeout(function() {
					for(var z in appear) {
						$container.find('#'+appear[z]).slideDown('slow');	
					}
				}, 150);
				//$dummy_div.remove();
			}
			
			for(var x in disappear) {
				$container.find('#'+disappear[x]).slideUp('fast',
				function() {
					self.disappear_count++;				
					if(self.disappear_count == disappear.length) {
						appear_callback();
					}
				});	
			}
			if(disappear.length == 0) {
				appear_callback();	
			}
		},
		date: {
			date_cell: function($container) {
				var branch = this;
				var date_content = $container.text();
				$container.data("original_date", date_content);
				var date_formatted = branch.date_format(date_content);
				$container.html(date_formatted);
				branch.date_popover($container);
			},
			date_popover: function($container) {
				//alert($container.text());
				var branch = this;
				var original_date = $container.data("original_date");
				original_date = original_date.split(" ")[0];
				var date_split = original_date.split("-");
				$container.click(function() {
					$.post(branch.root.actions, {
						action: 'calendar_popover',
						year: date_split[0],
						month: date_split[1],
						day: date_split[2]
					}, function(data) {
						$('.calendar_popover').html(data);
						$('.calendar_popover').find('.day_'+date_split[1]+"-"+date_split[2]+"-"+date_split[0]).css('background', 'rgba(255,255,255,0.1)');
						$('.body_container').addClass('blur');	
						$('.calendar_popover').css({
							'top': '150px',
							'left': '150px',
							'right': '150px',
							'bottom': '150px',
							'display': 'block',
							'opacity': '0'
						}).animate({
							'top': '0px',
							'left': '0px',
							'right': '0px',
							'bottom': '0px',
							'opacity': '1'
						}, 650, 'easeInOutQuint', function() {
							$(this).click(function() {
								$('.body_container').removeClass('blur');	
								$('.calendar_popover').animate({
									'opacity': '0'
								}, 350, 'easeInOutQuad', function() {
									$(this).css('display', 'none');	
								});
							});
						});
					});
				});
			},
			date_picker: function($input) {
				/*$input.focus(function() {
					
				});*/
			},
			date_format: function(datetime) {
				var datetime = datetime.split(" ");
				var date = datetime[0];
				var time = "";
				if(datetime.length > 1) {
					time = datetime[1];	
				}
				var date_split = date.split("-");
				var year = date_split[0];
				var month = date_split[1];
				var day = date_split[2];
				var month_string = "";
				switch(month) {
					case "1":
						month_string = "Jan";				
						break;
					case "2":
						month_string = "Feb";				
						break;	
					case "3":
						month_string = "Mar";				
						break;	
					case "4":
						month_string = "Apr";				
						break;	
					case "5":
						month_string = "May";				
						break;	
					case "6":
						month_string = "Jun";				
						break;	
					case "7":
						month_string = "Jul";				
						break;	
					case "8":
						month_string = "Aug";				
						break;	
					case "9":
						month_string = "Sep";				
						break;	
					case "10":
						month_string = "Oct";				
						break;	
					case "11":
						month_string = "Nov";				
						break;	
					case "12":
						month_string = "Dec";				
						break;			
				}
				
				
				var result = "";
				result += day+" "+month_string+" "+year;
				if(time != "") {
					time = time.substr(0, time.length-3);	
					result += " "+time;
				}
				return result;
			}
		},
		single_row_columns: function($parent, set_width) {
			/*var max_widths = Array();
			$parent_container.each(function() {
				$parent = $(this);
				$parent.children().each(function(index) {
					var width = $(this).widht();
					if(typeof max_widths[index] === 'undefined' || max_widths[index] < width) {
						max_widths[index] = width;	
					}
				});
			});*/
			
			var child_count = 0;
			$parent.find('.table_column').each(function() {
				if($(this).css('display') != 'none') {
					child_count++;	
				}
			});
			var width = 100;//$parent.width();
			var max_width = width/child_count;
			//alert(max_width);
			$parent.children().each(function() {
				/*var child_width = $(this).width();
				if(child_width > max_width) {
						
				}*/
				if(typeof set_width !== 'undefined') {
					$(this).css('width', max_width+"%");
				} else {
					$(this).css('max-width', max_width+"%");
				}
			});
		},
		pop_up: {
			queue: Array(),
			display: function(message, type) {
				var $popup = $('.overlay_black').find('.pop_up').first();
				$popup.find('.message').html(message);
				switch(type) {
					case 'fadeout':
						$('.overlay_black').css('display', 'block');
						$('.body_container').addClass('blur');
						$('.overlay_black').animate({
							'opacity': 1
						}, 600, 'easeOutCirc');
						$popup.css('display', 'block').animate({
							'opacity': 1
						}, 800, 'easeInOutQuad', function() {
							setTimeout(function() {
								$('.body_container').removeClass('blur');
								$('.overlay_black').animate({
									'opacity': 0
								}, 600, 'easeOutExpo', function() {
									$(this).css('display', 'none');	
									
								});
								$popup.animate({
									'opacity': 0
								}, 600, 'easeOutCirc', function() {
									
									$(this).css('display', 'none');	
								});
							}, 2500);
						});
						break;	
				}
			}
		},
	}
};