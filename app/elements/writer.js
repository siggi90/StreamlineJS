app.components.writer = {
	initialised: false,
	init: function() {
		/*if(!this.initialised) {
			var interlope = 0;
			setInterval(function() {
				if(interlope == 0) {
					$('.line_indicator:visible').css('opacity', 0);
					interlope = 1;
				} else {
					$('.line_indicator:visible').css('opacity', 1);
					interlope = 0;
				}
			}, 600);
			this.initialised = true;
		}*/
	},
	clear_writers: function(container) {
		for(var x in this.list) {
			if(this.list[x] != null) {
				if(typeof this.list[x].container !== 'undefined') {
					//console.log('this_container: '+this.list[x].container[0].id+' class: '+this.list[x].container[0].className);
					//console.log('input_container: '+container[0].id+' class: '+container[0].className);
					if(this.list[x].container[0] == container[0]) {
						$('#writer_'+x).remove();
						$('#writer_store_'+x).remove();
						$('#writer_length_'+x).remove();
						$('#writer_height_'+x).remove();
						this.list[x] = null;	
					}
				}
			}
		}
	},
	list: Array(),
	make_writer: function(object, margin, callback, multiline, width, height_margin, style, activate_callback, height_change_callback, suffix, container) {
		var self = this;
		function writer(obj, margin, callback, multiline, width, height_margin, style, activate_callback, height_change_callback, suffix, container) {
			self.init();
			$(window).resize(function() {
				$('input.writer').blur();
			});
			var w = this;
			if(typeof height_change_callback !== 'undefined' && height_change_callback !== null) {
				this.height_change_callback = height_change_callback;
			}
			if(typeof suffix !== 'undefined' && suffix !== null) {
				this.suffix = suffix;
			}
			if(typeof container !== 'undefined' && container !== null) {
				this.container = container;	
			}
			this.obj = obj;
			this.multiline = multiline;
			this.id = self.list.length;
			if(width != null) {
				this.width = width;
			} else {
				this.width = obj.find('.value').width();	
			}
			this.height = 0;
			this.width_point = 0;
			this.line_count = 0;
			this.writer_height = null;
			this.height_margin = height_margin;
			this.margin = margin;
			this.character_point = 0;
			this.inset = true;
			this.style = {
				fontSize: obj.css('font-size'),
				fontWeight: obj.css('fontWeight'),
				margin: obj.css('margin'),
				padding: obj.css('padding')
			};
			if(typeof activate_callback !== 'undefined') {
				this.activate_callback = activate_callback;	
			}
			if(typeof style !== 'undefined') {
				this.style.fontWeight = style.fontWeight;
				this.style.fontSize = style.fontSize;
			}
			var top = obj.offset().top;
			$('#writers').append("<div id='writer_length_"+self.list.length+"' class='writer_container' style='position:absolute; top:300px; left:0px; width:auto; height:auto; opacity:0'></div><input type='text' id='writer_"+self.list.length+"' class='writer' /><input type='text' id='writer_store_"+self.list.length+"' />"); // style='position:absolute; top:"+top+"px'
			this.writer = $('#writer_length_'+self.list.length);
			//this.length = $("#writer_length_"+self.list.length);
			
			if(this.multiline == true) {
				$('#writers').append("<div id='writer_height_"+this.id+"' class='writer_container' style='width:"+this.width+"px; height:auto; background:red;'></div>");	
				this.height = $("#writer_height_"+this.id).height();
				$("#writer_height_"+this.id).css(this.style).css({
					width: this.width+'px'
				});
				
				w.writer_height = $("#writer_height_"+this.id);
				this.line_count == 1;
				this.height = 0;
				this.width_point = 0;
			}
			var input_id = 'writer_'+self.list.length;
			var input_store_id = 'writer_store_'+self.list.length;
			document.getElementById(input_id).onblur = function() {
				if(w.interlope) {
					w.toggle_edit();	
				}
			};
			this.input = $('#'+input_id);
			this.input_store = $('#'+input_store_id);
			this.input.val(this.obj.find('.value').html());
			//text_selectable
			var val_id = this.obj.find('.value').attr('id');
			this.obj.html("<div style='position:relative'><div class='value'>&nbsp;</div><div class='line_indicator' style='position:absolute; display:none;' id='line_indic_"+self.list.length+"'></div></div>");
			if(typeof this.line_height_margin === 'undefined') {
				this.line_height_margin = w.obj.height()-parseInt(w.style.fontSize);	
			}
			this.obj.find('.value').html((this.input.val().length > 0 ? this.input.val() : '&nbsp;' ));
			 //display:none;
			this.line_indicator = $("#line_indic_"+self.list.length);
			this.line_indicator.css({ 
				'height': this.style.fontSize,
				'top':  -(parseInt(w.style.fontSize))
			});
			this.writer.css(this.style);
			this.writer.html(w.input.val());
			this.char_points = Array();
			if(typeof this.fontSize !== 'undefined') {
				if(isNaN(this.fontSize) && this.fontSize.indexOf('px') != -1) {
					this.fontSize = eval(this.fontSize.substr(0, this.fontSize.indexOf('px')));	
				}
			}
			this._length = 0;
			this.suggestion = function(suggestion_table, callback, required) {
				w.suggestion_table = suggestion_table;
				w.sug = self.parent.suggest.new();
				w.sug.init(w.suggestion_table, w.input, w.obj, callback);
				if(typeof required !== 'undefined' && required != null) {
					w.suggest_require = required;	
				}
			};
			this.clear_indicator = function() {
				clearInterval(w.indicator_interval);
			};
			this.blink_indicator = function() {
				var interlope = 0;
				w.clear_indicator();
				w.indicator_interval = setInterval(function() {
					if(interlope == 0) {
						w.line_indicator.css('opacity', 0);
						interlope = 1;	
					} else {
						w.line_indicator.css('opacity', 1);
						interlope = 0;
					}
				}, 600);
			};
			this.update_width = function() {
				this.width = this.obj.find('.value').width();
				$("#writer_height_"+this.id).css({
					width: this.width+'px'
				});
			};
			this.append_suffix = function() {
				w.obj.find('.value').append(w.suffix);
			};
			this.nbps = function(value) {
				/*if(value == "") {
					return " ";	
				}*/
				var len = value.length;
				value = value.split(" ");
				var output = "";
				var counter = 0;
				for(var x in value) {
					if(value[x] == "") {
						if(w.line_increase && x == value.length-1) {
							output += " &nbsp;";	
						} else if(typeof w.char_break_point !== 'undefined' && w.char_break_point == len-1 && x == value.length-1) {
							output += " &nbsp;";
						} else {
							output += "&nbsp;";
						}
						//output += " &nbsp; ";
					} else {
						if(counter > 0) {
							output += " "+value[x];
							//output += value[x]+" ";
						} else {
							output += value[x];	
							//output += value[x]+" ";
						}
					}
					counter++;
				}
				return output;
			};
			this.line_increase = false;
			this.update_writer = function(e) {
				var value = w.input.val();
				var key = -1;
				if(typeof e !== 'undefined') {
					if(e.which) { key = e.which; }
					if(e.keyCode) {	key = e.keyCode; }
					if(key == 37) {
						var rest = value.substr(value.length-1, value.length)+w.input_store.val();
						value = value.substr(0, value.length-1);
						w.input_store.val(rest);
						w.input.val(value);
					} else if(key == 39) {
						var append = w.input_store.val().substr(0, 1);
						value = value + append;
						var rest = w.input_store.val().substr(1, w.input_store.val().length);
						w.input_store.val(rest);
						w.input.val(value);
					}
				}
				value = w.input.val();
				w.update_width();
				
				if(value.length == 0) {
					value = "&nbsp;";	
				}
				if(value.length > this._length) {
					this.char_pos++;	
				} else {
					this.char_pos--;	
				}
				this._length = value.length;
				value = w.nbps(value);
				/*if(w.line_increase) {
					w.line_increase = false;	
				}*/
				//value = value.split(" ").join(" &nbsp");//value.replace(/ /g, "&nbsp;");
				var height_value = value;
				if(key == 32) {
					//value = value.substr(0, w.input.val().length-2);
					//value += "&nbsp;";
					//w.input.val(w.input.val().substr(0, w.input.val().length-1)+'_');	
				}
				//value = value.replace('/_/', '&nbsp;');
				var offset = 0;
				/*if(w.input.val().length == 0) {
					value = "&nbsp;";
					offset = -4;
				}*/
				if(w.multiline && w.inset) {
					for(x=0; (x<parseInt(margin)); x++) {
						//height_value = '&nbsp;'+height_value;	
					}
				}
				/*alert(height_value); //villan hefur eitthvað með char point að gera sennilega.
				alert(margin);
				alert(w.width);*/
				//alert('height_value ' + height_value);
				var output_value = height_value+w.input_store.val();
				if(typeof w.suffix !== 'undefined') {
					output_value = height_value+w.input_store.val()+w.suffix;
				}
				w.obj.find('.value').html(output_value); // w.input_store.val()
				if(!w.multiline) {
					w.writer.html(height_value);
					w.line_indicator.css({
						'display':'block',
						'left': (w.writer.width()+margin+offset),//(w.obj.find('.value').css('text-align') == 'center' ? ((w.obj.width()/2)+(w.writer.width()/2)) : w.writer.width()+margin+offset),
						'top':  -(parseInt(w.style.fontSize))+(typeof w.height_margin !== 'undefined' && w.height_margin !== null ? w.height_margin:0)
					});
				} else {
					var end_cut =  w.input.val().length-1;
					if(w.input.val().length == 0) {
						end_cut = 0;	
					}
					var cut_value = w.input.val().substr(0, end_cut);
					cut_value = w.nbps(cut_value);
					$("#writer_height_"+w.id).html(cut_value);
					if($("#writer_height_"+w.id).height() < w.height) {
						w.char_break_point = w.input.val().length-1;
					}
					$("#writer_height_"+w.id).html(height_value);
					if(w.line_increase) {
						w.line_increase = false;
						w.line_count++;	
						w.character_point = value.length-1;
						var last_space = value.lastIndexOf(' ');
						if((w.character_point-1) != last_space) {
							w.character_point = last_space;	
						}
						w.char_points[w.line_count] = w.character_point;
					} else if($("#writer_height_"+w.id).height() > w.height) {
						if(typeof w.height_change_callback !== 'undefined') {
							w.height_change_callback();
						}
						w.line_increase = true;
						w.char_break_point = w.input.val().length-1;
						/*w.line_count++;	
						w.character_point = value.length-1;
						var last_space = value.lastIndexOf(' ');
						if((w.character_point-1) != last_space) {
							w.character_point = last_space;	
						}
						w.char_points[w.line_count] = w.character_point;*/
					} else if($("#writer_height_"+w.id).height() < w.height) {
						if(typeof w.height_change_callback !== 'undefined') {
							w.height_change_callback();
						}
						w.char_points[w.line_count] = null;
						w.line_count--;	
						w.character_point = w.char_points[w.line_count];
					} else {
						if(typeof w.char_points[w.line_count] === 'undefined') {
							w.char_points[w.line_count] = 0;
							w.character_point = w.char_points[w.line_count];
						}
					}
					//this.width = this.writer.width() - this.width;
						//$("#writer_height_"+w.id).text().length;
					w.width_point = parseInt(w.writer.width());
					w.height =  $("#writer_height_"+w.id).height();
					if(w.line_count == 1) {
						w.width_point = 0;	
						w.character_point = 0;
					}
					value = value.substr(w.character_point); 
					var v = (w.line_count == 1 ? height_value : value);
					//this.char_pos = value.length - 1;
					if(typeof this.char_pos !== 'undefined') {
						//v = v.substr(0,this.char_pos);	
						// Vantar að updatea this.char_pos 
					}
					w.writer.html(v);
					w.width = parseInt(w.writer.width()); //- w.width_point;
					if(w.input.val() == "") {
						w.line_indicator.css({
							'display':'block',
							'left': '0px',//(w.line_count == 1 ? margin+w.width+'px' : w.width+'px'),
							'top':  4+((w.line_count-1)*(parseInt(w.style.fontSize)+w.line_height_margin))+'px' //(typeof w.height_margin !== 'undefined' && w.height_margin !== null ? w.height_margin:0)+
						});
					} else {
						w.line_indicator.css({
							'display':'block',
							'left': (!isNaN(w.char_pos) ? w.get_dimensions()+margin : margin+w.width+'px'),//(w.line_count == 1 ? margin+w.width+'px' : w.width+'px'),
							'top':  4+((w.line_count-1)*(parseInt(w.style.fontSize)+w.line_height_margin))+'px' //(typeof w.height_margin !== 'undefined' && w.height_margin !== null ? w.height_margin:0)+
						});
					}
				}
				//alert(w.writer.width());
				//alert('writer_html: '+ w.writer.html());
				if(key == 13) {
					w.stop_edit();
				}
				if(w.line_increase) {
					w.update_writer();	
				}
			};
			this.stop_edit = function() {	
				if(w.obj.find('.value').html().length == 0 || w.obj.find('.value').html() == " " || w.obj.find('.value').html().trim().length == 0) {
					w.obj.find('.value').html('&nbsp');
				}
				w.line_indicator.hide();
				this.interlope = false;
				w.input.unbind('keyup.writer').blur();
				if(typeof w.suggestion_table !== 'undefined') {
					if(w.sug.value != "") { // || w.suggest_require
						w.input.val(w.sug.value);
						w.obj.find('.value').html(w.sug.value);
					} else {
						w.input.val("");
						w.obj.find('.value').html("&nbsp;");
					}
					w.sug.hide_suggestion();
				}
				callback(w);
			};
			this.find_position = function(dimensions) {
				var char_pos = 0;
				/*for(x in this.dimensions) {
					self.root.log('dimensions:');
					self.root.log(this.dimensions[x].width);
					if(this.dimensions[x].width < dimensions.x && this.dimensions[x].height < dimensions.y) {
						char_pos = this.dimensions[x].pos;
					}
				}*/
				var line = parseInt(dimensions.y/parseInt(this.style.fontSize));
				line = line - 1;
				if(line < 0) {
					line = 0;	
				} else if(line > this.line_count) {
					line = this.line_count;	
				}
				dimensions.x -= 12;
				//self.root.log(parseInt());
				var click_ratio = dimensions.x/this.obj.width(); 
				var arr_pos = parseInt(click_ratio*this.dimensions[line].length)-1;
				//alert(line);
				//alert(arr_pos);
				alert(this.dimensions.length);
				alert(this.dimensions[line].length);
				if(this.dimensions.length == 0) {
					return 0;	
				}
				if(this.dimensions[line].length == 0) {
					return 0;	
				}
				if(arr_pos < 0) {
					arr_pos = 0;	
				} else if(arr_pos >= this.input.val().length) {
					arr_pos = this.input.val().length-1;	
				}
				var pos_found = false;
				var font_size = parseInt(this.style.fontSize)/4;
				while(!pos_found) {
					if(this.dimensions.x > this.dimensions[line][this.dimensions[line].length-1].width) {
						char_pos = this.dimensions[line].length-1;
						pos_found = true;
					} else if(this.dimensions[line][arr_pos].width < (dimensions.x+font_size) && this.dimensions[line][arr_pos].width > (dimensions.x-font_size)) {
						char_pos = this.dimensions[line][arr_pos].pos;
						pos_found = true;
					} else if(this.dimensions[line][arr_pos].width > (dimensions.x)) {
						arr_pos--;	
						if(arr_pos < 0) {
							arr_pos = 0;
							pos_found = true;
							char_pos = this.dimensions[line][arr_pos].pos;
						}
					} else if(this.dimensions[line][arr_pos].width < (dimensions.x)) {
						arr_pos++;
						if(arr_pos >= this.dimensions[line].length) {
							arr_pos = this.dimensions[line].length-1;
							pos_found = true;
							char_pos = this.dimensions[line][arr_pos].pos;
						}	
					} else if(this.dimensions.x < this.dimensions[line][0].width) {
						char_pos =  this.dimensions[line][0];
						pos_found = true;	
					}
				}
				this.char_pos = this.dimensions[line][arr_pos].pos;
				//alert(char_pos);
				return char_pos;
			};
			this.click_edit = function(event) {
				var cl_pos = {
					x: event.clientX-this.obj.offset().left,
					y: event.clientY-this.obj.offset().top	
				};
				this.make_dimensions();	
				this.toggle_edit(this.find_position(cl_pos));
			};
			this.dimensions = Array();
			this.get_dimensions = function() {
				this.dimension_div();
				var height;
				var width_subtr = 0;
				var width;
				var line_count = 0;
				for(var x = 0; x<this.char_pos; x++) {
					var _value = this.value.substr(0,x);
					$("#dim_length_"+this.id).html(_value);
					$("#dim_height_"+this.id).html(_value);
					/*if($("#dim_height_"+this.id).height() > height) {
						this.dimensions.push(Array());
						line_count++;	
						width_subtr = width;
					}*/
					height = $("#dim_height_"+this.id).height();
					width = $("#dim_length_"+this.id).width() - width_subtr;
				}
				return width;
			};
			this.dimension_div = function() {
				if($('#writers').find('#dim_length_'+this.id).length == 0) {
					$('#writers').append("<div id='dim_length_"+this.id+"' style='position:absolute; top:300px; left:0px; width:auto; height:auto; opacity:0'></div>");
					$('#writers').append("<div id='dim_height_"+this.id+"' style='width:"+this.width+"px; background:red;'></div>");
					$("#dim_length_"+this.id).css(this.style);
					$("#dim_height_"+this.id).css(this.style);
				}
			};
			this.make_dimensions = function() {
				this.dimension_div();
				this.value = this.obj.find('.value').html();
				this.value = this.value.replace(/&nbsp;/g, "");
				if(this.value == " ") {
					this.value = "";	
				}
				alert(this.value);
				var height = 0;
				var width_subtr = 0;
				var width;
				var line_count = 0;
				this.dimensions.push(Array());
				for(var x = 0; x<this.value.length; x++) {
					var _value = this.value.substr(0,x);
					$("#dim_length_"+this.id).html(_value);
					$("#dim_height_"+this.id).html(_value);
					if($("dim_height_"+this.id).height() > height) {
						this.dimensions.push(Array());
						line_count++;	
						width_subtr = width;
					}
					height = $("#dim_height_"+this.id).height();
					width = $("#dim_length_"+this.id).width() - width_subtr;
					this.dimensions[line_count].push({
						height: height,
						width: width,
						pos: x	
					});
				}
			};
			/*var self = this;
			this.click(function(event) {
				self.click_edit(event);
			});*/
			this.focus = function() {
				this.input.focus();
			};
			this.interlope = false;
			this.toggle_edit = function(position) {
				if(typeof position === 'undefined') {
					position = this.input.val().length;	
				}
				if(!this.interlope) {
					this.blink_indicator();
					this.update_writer();
					//this.input.keyup(this.update_writer).focus();
					//this.input.on("keyup", "#
					this.input.bind('keyup.writer', this.update_writer).focus();
					/*
					function(event) {
						this.update_writer(event);
					}
					*/
					this.input[0].setSelectionRange(position, position);
					this.update_writer();
					if(typeof w.suggestion_table !== 'undefined') {
						w.sug.trigger_suggestion();
					}
					if(typeof this.activate_callback !== 'undefined') {
						this.activate_callback();	
					}
					this.interlope = true;
				} else {
					this.clear_indicator();
					this.stop_edit();
					this.interlope = false;
					/*if(typeof this.save_callback !== 'undefined') {
						this.save_callback(this.input.val());	
					}*/
				}
				if(typeof this.toggle_callback !== 'undefined') {
					this.toggle_callback();	
				}
			};
		}
		this.list.push(new writer(object, margin, callback, multiline, width, height_margin, style, activate_callback, height_change_callback, suffix, container));
		return this.list[this.list.length-1];
	}//,
};