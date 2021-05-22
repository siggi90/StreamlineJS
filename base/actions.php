<?
	//echo "test";
	/*if(isset($_GET['action']) {
		echo $_GET['action'];
	}*/
	//include 'app.php';
	//include '../control.php';
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	$files = get_included_files();

	//var_dump($files);
	$app_directory = $files[0];
	$dir_split = explode("/", $app_directory);
	$dir = "";
	$class_prefix = "";
	foreach($dir_split as $key => $value) {
		if($key > 0) {
			$dir .= "/";	
		}
		if($key < (count($dir_split)-1)) {
			$dir .= $value;
			$class_prefix = $value;
		}
	}
	include $dir."app.php";
	include 'action_handler.php';

	//var_dump("test");

	$_POST['action'] = $_REQUEST['action'];
	
	if(isset($_REQUEST['action'])) {
		
		$action_handler = new action_handler();
		echo $action_handler->handle_action($modules, $class_prefix, $_POST);
	
	}

?>