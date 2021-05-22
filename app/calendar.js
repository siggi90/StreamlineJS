app.elements.calendar = {
	init: function(content_item, $container, page_data, interpretation_branch, page) {
		var branch = this;
		
		var calendar_object = {
			toggle: 0,
			current_hour: null,
			$calendar_container: null,
			operation: {
				load: function(send_data, search_string, deny_on_load) {
					var self = this;
					self.root.load_calendar_events(undefined, deny_on_load);	
				}
			},
			$month_select: null,
			$year_select: null,
			init: function() {
				var self = this;
				/*setInterval(function() {
					var date = new Date();
					var hour = date.getHours();
					if(self.current_hour != hour) { // && (hour == 0 || hour == 12)
						var editing_in_progress = self.root.global.editing_in_progress();
						if(!editing_in_progress) {
							self.current_hour = hour;
							//self.load();	
						}
					}
				}, 1800000);*/
				
				var html = $('#templates').first().find('#calendar_template').first()[0].outerHTML;
				$container.append(html);
				var $calendar_container = $container.find('#calendar_template').first();
				$calendar_container.attr('id', content_item.id+'_calendar').show();
				self.$calendar_container = $calendar_container.find('.calendar_container');
				
				if(!content_item.no_controls) {
					$calendar_container.prepend("<div class='calendar_controls'><select class='year_select'><option disabled selected value>Select Year</option></select><select class='month_select'><option disabled selected value>Select Month</option></select></div>");
					var year = new Date().getFullYear();
					var current_year = year;
					var max_year = year+30;
					var $calendar_controls = $calendar_container.find('.calendar_controls').first();
					var $year_select = $calendar_controls.find('.year_select');
					while(year < max_year) {
						$year_select.append("<option value='"+year+"'>"+year+"</option>");
						year++;	
					}
					var $month_select = $calendar_controls.find('.month_select');
					var counter = 1;
					var months = [
						"January", "February", "March", "April", "May",
						"June", "July", "August", "September", "October",
						"November", "December"
					];
					while(counter <= 12) {
						$month_select.append("<option value='"+counter+"'>"+months[counter-1]+"</option>");
						counter++;	
					}
					$year_select.on('change', function() {
						self.load($(this).val(), $month_select.val());
					});
					$month_select.on('change', function() {
						self.load($year_select.val(), $(this).val());
					});
					var date_object = new Date();
					var current_monht = date_object.getMonth()+1;
					$year_select.val(current_year);
					$month_select.val(current_monht);
					//alert(current_year);
					//alert(current_month);
					self.$month_select = $month_select;
					self.$year_select = $year_select;
				}
				
				/*$('.calendar_day_view .close_button').click(function() {
					self.current_day_view = null;
					$('.calendar_container').removeClass('blur');
					$('.time_container').removeClass('blur');
					$('.calendar_day_view').animate({
						'opacity': 0
					}, 1250, 'ease_out_x', function() {
						$(this).css({
							'display': 'none'
						})
					});
				});*/
				
				self.load();
			},
			current_date: null,
			year: '',
			month: '',
			load_calendar_events: function(reload_view, deny_on_load) {
				var self = this;
				var post_data = {
					'action': 'events',
					'year': self.year,
					'month': self.month,
					'first_day': self.first_day,
					'last_day': self.last_day
				};
				if(typeof content_item.post_data !== 'undefined') {
					interpretation_branch.apply_load_mask(post_data, content_item.post_data, page_data);	
				}
				branch.root.post(branch.root.actions, post_data, function(data) {
					//if(self.current_day_view != null) {
					//	self.load_day_view(self.current_day_view);	
					//}
					self.clear_events(data);
					for(var x in data) {
						self.add_events(x, data[x], undefined, reload_view);
					}
					
					if(!deny_on_load) {
						if(content_item.on_load) {
							branch.root.interpretation.on_load(content_item);
						}
					}
				}, "json");
			},
			clear_events: function(dates) {
				var self = this;
				self.$calendar_container.find('.calendar_cell').each(function() {
					var $this = $(this);
					$this.find('.events').html("");
					//var date = $this.attr('id').split('day_')[1];
				});
			},
			row_height: null,
			add_events: function(date, events, $container, reload_view) {
				var self = this;
				var $events = self.$calendar_container.find('#day_'+date).find('.events').first();
				if(typeof $container !== 'undefined') {
					$events = $container;	
				}
				if(!reload_view) {
					$events.html("");
				} else {
					branch.root.clear_removed_items(events, $events, "event", "event");	
				}
				var html = $('#event_template').first()[0].outerHTML;
				//this.row_height = $('.calendar_container').find('#day_'+date).parent().height();
				var $last_item = null;
				for(var x in events) {
					if(reload_view) {
						$events.append(html);
					} else {
						$last_Item = branch.root.replace_append(html, $events, $last_item, events[x].id);
					}
					$events.find('#event_template').first().attr('id', "event_"+events[x].id);
					var $event = $events.find('#event_'+events[x].id).first();
					$event.find('.project_bullet').css({
						'background-color': 'hsla('+events[x].color+')'
					});
					$event.attr('title', events[x].value);
					$event.find('.event_value').html(events[x].value);
					$event.attr('draggable', 'true');
					$event.on('dragstart', function drag(event) {
						event.dataTransfer = event.originalEvent.dataTransfer;
						event.dataTransfer.setData("id", event.target.id);
						event.dataTransfer.setData("date", $event.parent().parent().attr('id'));
					});
					$event.show();
					$event.on('dragover', function(event) {
						event.preventDefault();
					});
					$event.on('drop', function(event) {
						event.preventDefault();  
						event.stopPropagation();
						event.dataTransfer = event.originalEvent.dataTransfer;
						var id = event.dataTransfer.getData("id").split("_");
						var date = event.dataTransfer.getData("date").split("day_")[1];
						
						var event_date = $event.parent().parent().attr('id').split("day_")[1];
						var add_to_day = false;
						if(event_date != date) {
							add_to_day = true;	
						}
						
						var id_prefix = id[0];
						var id_suffix = id[1];
						var this_id = this.id.split('event_')[1];
						switch(id_prefix) {
							case 'event':
								if(!add_to_day) {
									self.save_order(id_suffix, this_id, $events);
								} else {
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'id': id_suffix,
										'event_date': event_date,
										'calendar_id': content_item.id
									}, function(data) {
										self.load_calendar_events();
										//self.save_order(id_suffix, this_id, $events);
									});	
								}
								break;	
						}
						if($events.parent().hasClass('calendar_cell')) {
							$events.parent().css({
								'background-color': 'transparent'
							});
						}
					});
					/*$event.dblclick(function() {
						
					});*/
					$event.click(function(event) {
						event.stopPropagation();
						self.select_li($(this));
					});
					(function(item) {
						var $checkbox = $event.find('input.complete').first();
						if(item.completed == 1) {
							$checkbox[0].checked = true;	
						}
						$checkbox.click(function() {
							if(this.checked) {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id,
									'completed': 1
								}, function(data) {
									self.on_load();
								});
							} else {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id,
									'completed': 0
								}, function(data) {
									self.on_load();
								});
							}
						});
					}(events[x]));
					/*var height = $('.calendar_container').find('#day_'+date).parent().height();
					if(height > this.row_height) {
						$event.hide();	
					}*/
					//$events.append(events[x].objective_id);
				}
			},
			on_load: function() {
				if(content_item.on_load) {
					branch.root.interpretation.on_load(content_item);
				}
			},
			$selected_li: null,
			selected_li: null,
			select_li: function($li, set) {
				var self = this;
				if(typeof set === 'undefined' || set === false) { 
					self.$calendar_container.find('.event.selected').removeClass('selected');
				}
				if($li != null) {
					$li.addClass('selected');
					this.$selected_li = $li;
					this.selected_li = this.$selected_li.attr('id');
				} else {
					this.$selected_li = null;	
					this.selected_li = null;
				}
			},
			save_order: function(dragged_value, dropped_value, $events, callback) {
				var self = this;
				var order_values = Array();
				$events.children().each(function() {
					var id = $(this).attr('id').split('event_')[1];//find('.id').first().html();
					order_values.push(id);
				});
				if(dropped_value == null) {
					var index_dragged = order_values.indexOf(dragged_value);
					order_values[index_dragged] = "-1";
					order_values.push(dragged_value);
				} else {
					var index_dragged = order_values.indexOf(dragged_value);
					if(index_dragged != -1) {
						order_values[index_dragged] = "-1";
					}
					var index_dropped = order_values.indexOf(dropped_value);
					order_values.splice(index_dropped, 0, dragged_value);
				}
				
				branch.root.post(branch.root.actions, {
					'action': 'events_set_order',
					'v': JSON.stringify(order_values)
				}, function(data) {
					self.load_calendar_events();
					if(typeof callback !== 'undefined') {
						callback();	
					}
				});
			},
			load_day_view: function(date) {
				var self = this;
				$('.calendar_day_view').attr('id', "day_"+date);
				var date_formatted = branch.root.interpretation.view.date.date_format(date);
				$('.calendar_day_view .day_name').html(date_formatted);
				branch.root.post(branch.root.actions, {
					'action': 'events_date',
					'date': date,
					'calendar_id': content_item.id
				}, function(data) {
					self.add_events(null, data, $('.calendar_day_view .events_container').first());
					$('.calendar_container').addClass('blur');
					$('.time_container').addClass('blur');
					$('.calendar_day_view').css({
						'display': 'unset',
						'opacity': 0
					}).animate({
						'opacity': 1
					}, 1250, 'ease_out_x', function() {
						
					});
				}, "json");
			},
			first_day: null,
			last_day: null,
			current_day_view: null,
			load: function(year, month, force_reload) {
				var self = this;
				var reload_view = false;
				if(month != self.month || year != self.year || !force_reload) {
					reload_view = true;	
				}
				var post_data = {
					'action': 'calendar'
				};
				if(typeof year !== 'undefined') {
					post_data.year = year;
					this.year = year;	
				} else if(self.year != null) {
					post_data.year = self.year;
				}
				if(typeof month !== 'undefined') {
					post_data.month = month;
					this.month = month;	
				} else if(self.month != null) {
					post_data.month = self.month;
				}
				if(typeof year !== 'undefined' && year.trim() != '') {
					self.$year_select.val(year);
				}
				if(typeof month !== 'undefined' && month.trim() != '') {
					self.$month_select.val(month);
				}
				$.post(branch.root.actions, post_data, function(data) {
					self.$calendar_container.html(data);
					self.first_day = self.$calendar_container.find('.calendar_cell').first().attr('id').split('day_')[1];
					self.last_day = self.$calendar_container.find('.calendar_cell').last().attr('id').split('day_')[1];
					self.$calendar_container.find('.prev_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					self.$calendar_container.find('.next_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					self.load_calendar_events(reload_view);
					self.$calendar_container.find('.calendar_cell').each(function() {
						var date = this.id.split('day_')[1];
						var $this = $(this);
						/*$this.find('.day_counter').first().click(function() {
							self.current_day_view = date;
							self.load_day_view(date);
						});*/
						$this.on('dragover', function(event) {
							event.preventDefault();
							$this.css({
								'background-color': 'rgba(0, 0, 0, 0.1)'
							});
						});
						$this.on('dragleave', function(event) {
							event.preventDefault();
							$this.css({
								'background-color': 'transparent'
							});
						});
						$this.on('drop', function(event) {
							event.preventDefault();  
							event.stopPropagation();
							event.dataTransfer = event.originalEvent.dataTransfer;
							var id = event.dataTransfer.getData("id").split("_");
							var prefix = id[0];
							var id_suffix = id[1];
							var this_id = this.id.split('day_')[1];
							switch(prefix) { 	
								/*case 'objective':
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'objective_id': id_suffix,
										'event_date': this_id
									}, function(data) {
										self.load_calendar_events();
									});
									break;*/
								case 'event':
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'id': id_suffix,
										'event_date': this_id,
										'calendar_id': content_item.id
									}, function(data) {
										self.load_calendar_events();
									});
									break;;
							}
							$this.css({
								'background-color': 'transparent'
							});
						});
						if(!content_item.no_add_event) {
							$this.dblclick(function() {
								var html = $('#event_template_edit').first()[0].outerHTML;
								$this.find('.events').first().append(html);
								var $edit = $this.find('#event_template_edit').first();
								$edit.find('textarea').first().focusout(function() {
									var post_data = {
										'action': '_calendar_event',
										'value': $edit.find('textarea').first().val(),
										'event_date': $edit.parent().parent().attr('id').split('day_')[1]
									};
									if(typeof content_item.post_data !== 'undefined') {
										interpretation_branch.apply_load_mask(post_data, content_item.post_data, page_data);	
									}
									branch.root.post(branch.root.actions, post_data, function(data) {
										self.load_calendar_events();
									});
								});
								branch.root.events.press_enter($edit.find('textarea'), function() {
									$edit.find('textarea').first().trigger('focusout');
								});
								$edit.show();
								$edit.find('textarea').focus();
							});
						}
					});
				});	
			}
		};
		
		branch.root.assign_root_object(calendar_object);
		
		branch.root.elements.calendars[content_item.id+"_calendar"] = calendar_object;
		calendar_object.init();
				
		interpretation_branch.loaded_objects[page.id].loaded();
	}
};