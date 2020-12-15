app.overview = {
	init_clock: function() {
		var branch = this;
		setInterval(function() {
			branch.run_second_hand();
		}, 500);
		var counter = 0;
		var value_label = 3;
		while(counter < 12) {
			var print_label = (counter+value_label);
			if(print_label > 12) {
				print_label = print_label - 12;	
			}
			$('#clock_center').prepend(
					"<div class='clock_value_container'>"+
						"<div class='clock_value'>"+
							print_label+
						"</div>"+
					"</div>");
			$('#clock_center').find('.clock_value_container').first().css("transform", "rotate("+(counter*30)+"deg)");
			$('#clock_center').find('.clock_value_container').first().find('.clock_value').css("transform", "rotate(-"+(counter*30)+"deg)");
			//alert("rotate("+(counter*30)+"deg);");
			counter++;
		}	
	
		var interlope = 0;
		$('#clock').click(function() {
			if(interlope == 0) {
				$('#clock_center').hide();
				$('#digital_clock').show();
				interlope = 1;
			} else {
				$('#clock_center').show();
				$('#digital_clock').hide();
				interlope = 0;
			}
		});
		
		var date = new Date();
		this.current_second = -90 + 6*date.getSeconds();
		this.current_minute = -90 + 6*date.getMinutes();	
		this.current_hour = -this.hour_offset_radius+30*(date.getHours());
		this.init_date();
		/*setTimeout(function() {
			branch.init_clock();
		}, 1000*60*60);*/
		setInterval(function() {
			branch.init_date();
		}, 60*60*6);
	},
	hour_offset_radius: 90,
	current_second: 90,
	run_second_hand: function() {
		var date = new Date();
		this.current_second = -90 + date.getSeconds()*6;
		this.current_minute = -90 + 6*date.getMinutes();	
		this.current_hour = -this.hour_offset_radius+30*(date.getHours());
		
		$('#clock_center').find('#second_container').css("transform", "rotate("+(this.current_second)+"deg)");
		$('#clock_center').find('#minute_container').css("transform", "rotate("+(this.current_minute)+"deg)");
		$('#clock_center').find('#hour_container').css("transform", "rotate("+(this.current_hour+((90+this.current_minute)/12))+"deg)"); //(this.current_minute/12)		
				
		/*if(this.current_second == (360-90)) {
			//this.current_second = -90;
			//this.current_minute += 6;					
			this.current_minute = -90 + 6*date.getMinutes();	
			this.current_hour = -this.hour_offset_radius+30*(date.getHours());
		}
		if(this.current_minute == (360-90)) {
			//this.current_minute = -90;
			//this.current_hour += (6*5);	
			this.current_minute = -90 + 6*date.getMinutes();	
			this.current_hour = -this.hour_offset_radius+30*(date.getHours());
		}
		/*if(this.current_hour == (360-90)) {
			this.init_date();	
		}*/
		/*if(this.current_hour >= (360-this.hour_offset_radius)) {
			this.current_hour -= this.hour_offset_radius;	
		}*/
		/*setTimeout(function() {
			run_second_hand();
		}, 1000);*/
	},
	init_date: function() {
		var date = new Date();
		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";
		var month_name = month[date.getMonth()];
		var month_date = date.getDate();
		$('#date_month').html(month_name);
		$('.date_content').html(month_date);
		var start_digit = (""+month_date).substring(0, 1);
		if(start_digit != "1") {
			$('.date_content').css({
				'margin-left': '-10px',
				'margin-right': '-10px'
			});
		}
	}
};