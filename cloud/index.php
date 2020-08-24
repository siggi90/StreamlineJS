<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" type="text/css" href="/icofont.min.css">
<title>Streamline | Noob Software</title>
<script type='text/javascript' src='/jquery.js'></script>
<script type='text/javascript' src='/jquery-ui.min.js'></script>
<script type='text/javascript' src='app.js'></script>
<style type='text/css'>
	@import "/css/base.css";
	
	body {
		/*background: url('/images/blue_blur_2.png');
		/*background: url('/images/rancrypt_back_2.png');*/
		/*background-position:left;*/
		/*background-position:25% 10%;
		/*background-size:150%;*/
		word-wrap: break-word;
		background: rgb(92,151,171);
	}	
	
	.body_container {
		/*background: url('/images/blue_blur_2.png'); /*green_colors_2*/
		/*background: rgb(92,151,171);
		/*background: linear-gradient(129deg, rgba(92,151,171,1) 0%, rgba(24,58,112,1) 88%);*/
		/*background:linear-gradient(129deg, rgb(92, 21, 36) 0%, rgb(24, 58, 112) 88%);*/
		/*background:linear-gradient(256deg, rgb(132, 250, 224) 0%, rgb(255, 197, 254) 108%);*/
		/*background:linear-gradient(256deg, rgba(132, 250, 224, 0.17) 0%, rgba(197, 255, 252, 0.34) 108%);*/
		/*background:linear-gradient(90deg, rgba(132, 244, 250, 0.17) 0%, rgba(255, 197, 197, 0.34) 108%);*/
		/*background:linear-gradient(-90deg, rgba(250, 198, 132, 0.55) 0%, rgba(170, 4, 4, 0.34) 108%);*/
		/*background:linear-gradient(0deg, rgba(250, 198, 132, 0.55) 0%, rgba(53, 5, 5, 0.24) 108%);/*linear-gradient(0deg, rgba(250, 198, 132, 0.4) 0%, rgba(53, 5, 5, 0.24) 108%);*/
		/*background:linear-gradient(0deg, rgba(125, 71, 1, 0.58) 0%, rgba(53, 5, 5, 0.24) 108%);*/
		background:linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(79, 0, 19, 0.7) 88%);
	}
	
	
	.secondary_back {
		/*background:linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,0,0,0.7) 88%); /*linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,7,254,0) 88%);*/
		
		position:fixed;
		top:0px;
		bottom:0px;
		left:0px;
		right:0px;	
		
		
		background: rgb(92,151,171);
		/*background: linear-gradient(129deg, rgba(92,151,171,1) 0%, rgba(24,58,112,1) 88%);*/
		/*background:linear-gradient(250deg, rgb(92, 21, 36) 0%, rgb(24, 58, 112) 88%);/*linear-gradient(129deg, rgb(92, 21, 36) 0%, rgb(24, 58, 112) 88%);*/
		/*background:linear-gradient(250deg, rgb(45, 0, 9) 0%, rgb(60, 145, 179) 88%);/*linear-gradient(250deg, rgb(45, 0, 9) 0%, rgb(24, 58, 112) 88%);*/
		/*background:linear-gradient(250deg, rgb(0, 3, 45) 0%, rgb(60, 145, 179) 88%);*/
		background:linear-gradient(129deg, rgb(132, 250, 224) 0%, rgb(255, 197, 254) 108%);
	}
	
	.menu_button {
		font-size:25px;	
	}
	

	
	
</style>
</head>

<body>
<!---->
<div class='secondary_back'></div>

<div class='body_container blur'><!--blur-->
    <!--<div class='title_wrap'><div class='title'>Streamline</div> <div class='sub_logo'>noob software</div></div>-->
    <?	include '../common/user_bar.php'; ?>
    <div class='body_wrap'>
    	<div id='body_frame' class='frame'>
        
        </div>
        <!--<div class='menu_top'>
        	<div class='menu_button'>Articles</div>
        	<div class='menu_button'>New Article</div>
        </div>-->
    </div>	
</div>
<div class='custom_frames' style='display:none;'>
    <div class='updates_container'>
    	<div class='content_light'>
	    	<button class='button' style='width:unset'>Download and Install Updates</button><div style='display:none;' class='loading_spinner'><div><i class='icofont-spinner-alt-2'></i></div></div>
        </div>
    </div>

</div>
<div class='dummy_div' style='display:none;'></div>

<? include '../common/common.php'; ?>
</body>
</html>