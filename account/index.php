<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" type="text/css" href="/icofont.min.css">
<title>Account | Noob Software</title>
<script type='text/javascript' src='/jquery.js'></script>
<script type='text/javascript' src='/jquery-ui.min.js'></script>
<!--<script src="https://www.google.com/recaptcha/api.js?render=your-key-here"></script>-->
<script type='text/javascript' src='app.js'></script>
<style type='text/css'>
	@import "/css/base.css";
	
	body { /*green*/
		/*background: url('/images/rancrypt_back_2.png');*/
		/*background-position:left;*/
		/*background-position:25% 10%;
		/*background-size:150%;*/
		word-wrap: break-word;
		/*background: url('/images/green.png');*/
		background:rgba(185,32,32,1);
	}	
	
	.body_container {
		/*background: url('/images/green.png');*/
		/*background: rgb(0,0,0);
		background: linear-gradient(129deg, rgba(0,0,0,1) 0%, rgba(45,217,255,1) 10%, rgba(0,0,0,1) 12%, rgba(172,26,249,1) 28%, rgba(0,0,0,1) 30%, rgba(34,237,255,1) 59%, rgba(0,0,0,1) 65%, rgba(52,144,170,1) 87%, rgba(0,0,0,1) 88%, rgba(154,0,255,1) 97%);*/
		
		 /*background: rgb(0,0,0);
background: linear-gradient(124deg, rgba(0,0,0,1) 0%, rgba(45,217,255,1) 10%, rgba(0,0,0,1) 12%, rgba(172,26,249,1) 28%, rgba(0,0,0,1) 30%, rgba(37,241,255,1) 41%, rgba(0,0,0,1) 42%, rgba(176,76,23,1) 43%, rgba(255,193,34,1) 59%, rgba(0,0,0,1) 65%, rgba(37,250,255,1) 69%, rgba(52,144,170,1) 87%, rgba(0,0,0,1) 88%, rgba(154,0,255,1) 97%); */
	/*background: rgb(0,0,0);
	background: linear-gradient(124deg, rgba(0,0,0,0.5092349193135246) 0%, rgba(45,217,255,0.4961201652151639) 10%, rgba(0,0,0,0.5026775422643442) 12%, rgba(172,26,249,0.538743116034836) 28%, rgba(0,0,0,0.5059562307889345) 30%, rgba(37,241,255,0.5125136078381147) 41%, rgba(0,0,0,0.4731693455430328) 42%, rgba(23,79,176,0.5026775422643442) 43%, rgba(183,34,255,0.5190709848872951) 59%, rgba(0,0,0,0.48956278816598364) 65%, rgba(37,250,255,0.46989065701844257) 69%, rgba(52,144,170,0.4502185258709016) 87%, rgba(0,0,0,0.4862840996413934) 88%, rgba(154,0,255,0.4993988537397541) 97%); */
	 background:  rgb(132, 250, 224);
/*background: linear-gradient(124deg, rgba(0,0,0,0.5092349193135246) 0%, rgba(255,45,45,0.4961201652151639) 10%, rgba(0,0,0,0.5026775422643442) 12%, rgba(249,183,26,0.538743116034836) 28%, rgba(0,0,0,0.5059562307889345) 30%, rgba(255,37,94,0.5125136078381147) 41%, rgba(0,0,0,0.4731693455430328) 42%, rgba(176,70,23,0.5026775422643442) 43%, rgba(255,198,34,0.5190709848872951) 59%, rgba(0,0,0,0.48956278816598364) 65%, rgba(255,37,94,0.46989065701844257) 69%, rgba(170,52,52,0.4502185258709016) 87%, rgba(0,0,0,0.4862840996413934) 89%, rgba(255,174,0,0.4993988537397541) 97%); */
/*background: linear-gradient(124deg, rgba(255,45,45,1) 0%, rgba(249,183,26,1) 100%);*/

		
	/*background: linear-gradient(129deg, rgba(132,0,24,1) 0%, rgba(1,7,254,1) 108%);*/
	/*background: linear-gradient(129deg, rgba(132,0,24,1) 0%, rgba(1,217,224,1) 108%);*/
	/*background: linear-gradient(129deg, rgba(132,0,24,1) 0%,  rgba(85,7,254,1) 108%);*/
	background:linear-gradient(129deg, rgb(132, 250, 224) 0%, rgb(255, 197, 254) 108%);
	}
	
	.secondary_back {
		background:linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,0,0,0.7) 88%); /*linear-gradient(30deg, rgba(250,138,54,0.7) 0%, rgba(0,7,254,0) 88%);*/
		position:fixed;
		top:0px;
		bottom:0px;
		left:0px;
		right:0px;	
	}
	
</style>
</head>

<body>
<!---->
<div class='body_container blur'><!--blur-->
    <!--<div class='title_wrap'><div class='title'>Streamline</div> <div class='sub_logo'>noob software</div></div>-->
    <div class='secondary_back'>
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
</div>

<? include '../common/common.php'; ?>
<div class='dummy_div' style='display:none;'></div>
</body>
</html>