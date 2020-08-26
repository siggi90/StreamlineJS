<div class='calendar_popover' style='display:none;'></div>
<div class='overlay_black'>
	<div class='user_options' style='display:none;'>
    	<div class='logged_in_options'  style='display:none;'>
            <div class='option_title account'>
                <a href='/account/'>Account</a>
            </div>
            <div class='option_title logout'>
                Log out
            </div>
            <div class='option_title back'>
                Back
            </div>
    	</div>
    	<div class='logged_out_options'>
            <div class='option_title account sign_up_button'>
                <a href='/account/#sign_up'>Sign Up</a>
            </div>
            <div class='option_title sign_in_button'>
                Sign In
            </div>
            <div class='option_title back'>
                Back
            </div>
    	</div>
    </div>
    <div class='login' style='display:none;'>
        <div class='login_elements'>
            <input type='text' id='username' placeholder="Email" />
            <input type='password' id='password' class='' Placeholder="Password" />
            <button class='sign_in'>Sign in</button><br/><br/>
            <button class='learn_more'>Learn more</button>
        </div>
    </div>
    <div id='body' class='night' style='display:none;'>
        <div class='clock_wrap'>
            <div id='clock_container'>
                <div id='clock' class='clock_element night'>
                    <div id='clock_center'>
                        <div class='clock_hand_container' id='second_container'>
                            <div class='clock_hand' id='second_hand'>
                            
                            </div>
                        </div>
                        <div class='clock_hand_container' id='minute_container'>
                            <div class='clock_hand' id='minute_hand'>
                            
                            </div>
                        </div>
                        <div class='clock_hand_container' id='hour_container'>
                            <div class='clock_hand' id='hour_hand'>
                            
                            </div>
                        </div>
                    </div>
                    <div id='digital_clock' style='display:none;'>
                        <div id='value'>16:24</div>
                        
                    </div>
                </div>
                <div id='date' class='clock_element night'>
                    <div class='date_content'>
                        17
                    </div>
                    <div id='date_month'>
                        February
                    </div>
                </div>
            </div>
        </div>
        <div class='footer'>
            noob software
        </div>
    </div>
    <div class='pop_up' style='display:none; opacity:0;'>
    	<div class='message'></div>
        <div class='buttons'></div>
    </div>
    <div class='search_container' style='display:none;'>
    	<div class='search_input_wrap'>
        	<input type='text' class='search_input' placeholder='search' /><i class='icofont-close-line-circled close_position_search'></i>
        </div>
        <div class='search_results_frame' id='search_results_frame'>
        	
        </div>
    </div>
</div>
