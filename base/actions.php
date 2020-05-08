<?
	//echo "test";
	/*if(isset($_GET['action']) {
		echo $_GET['action'];
	}*/
	//include 'app.php';
	//include '../control.php';
	$files = get_included_files();
	$app_directory = $files[0];
	$dir_split = explode("/", $app_directory);
	$dir = "";
	foreach($dir_split as $key => $value) {
		if($key > 0) {
			$dir .= "/";	
		}
		if($key < (count($dir_split)-1)) {
			$dir .= $value;
		}
	}
	include $dir."app.php";
	
	if(isset($_REQUEST['action'])) {
		$statement;
		$action = $_REQUEST['action'];
		$_POST = $_REQUEST;
		unset($_POST['action']);
		$app = new app();
		//$appstat = $app->appstat;
		
		//echo $app->test();
		//var_dump($_POST);

		function json($var) {
			if(is_array($var)) {
				return $var;	
			}
			$json = json_decode($var, true);
			//return (json_last_error() == JSON_ERROR_NONE);
			if(is_array($json)) {
				return $json;	
			}
			return $var;
		}
		
		function clean_var($var) {
			if(is_array($var)) {
				foreach($var as $key => $value) {
					$var[$key] = clean_var($var[$key]);
				}
			} else {
				return mysqli_escape_string(mysqli_connect('localhost', 'root', ''), $var);	
				//return $var;
			}
			return $var;
		}
		

		foreach($_POST as $key => $value) {
			$_POST[$key] = json($_POST[$key]);
			$_POST[$key] = clean_var($_POST[$key]);
			//echo "clean: ".$_POST[$key]."<br>";	
		}
		
		/*$modules = array(
			//"random",
		);*/
		$module = "";
		if(isset($_POST['module'])) {
			$module = $_POST['module'];//."->";
			unset($_POST['module']);
		}
		
		function class_method($module, $action, $app, $post_flag=false) {
			$statement = "";
			if($module != "") {
				$module = $module."->";
			}
			//$statement = 'echo $app->'.$module.$action.'($_POST);';
			if(!$post_flag) {
				$statement = '$app->'.$module.$action.'(';
				$counter = 0;
				foreach($_POST as $key => $value) {
					$comma_prefix = ($counter > 0 ? ", " : "");
					//$statement .= $comma_prefix.$value;
					$statement .= $comma_prefix."\$_POST['".$key."']";
					$counter++;
				}
				$statement .= ');';
			} else {
				$statement = '$app->'.$module.$action.'($_POST);';	
			}
			return $statement;
		}
		
		function find_module($action, $app, $modules, $post_flag=false) {
			$statement = "";
			foreach($modules as $module) {
				$if_statement = "return method_exists(\$app->".$module.", '".$action."');";
				//echo $if_statement."<br>";
				if(eval($if_statement)) {
					$statement = class_method($module, $action, $app, $post_flag);
				}
			}
			return $statement;
		}
		//$id = $_POST['id'];
		
		if($module != "") {
			if(substr($action, 0, 1) == '_') {
				$if_statement = "return method_exists(\$app->".$module.", '".$action."');";
				if(eval($if_statement)) {
					$statement = '$app->'.$module."->".$action.'($_POST);';
				}
			} else {
				$statement = class_method($module, $action, $app);
			}
		} else {
			if(substr($action, 0, 1) == '_') {
				$if_statement = "return method_exists(\$app, '".$action."');";
				if(eval($if_statement)) {
					$statement = class_method("", $action, $app);
				} else {
					$statement = find_module($action, $app, $modules, true);
				}
			} else {
				$if_statement = "return method_exists(\$app, '".$action."');";
				if(eval($if_statement)) {
					$statement = '$app->'.$action.'($_POST);';
				} else {
					$statement = find_module($action, $app, $modules);
				}
			}
		}
		if($statement != "") {
			$split = explode("->", $statement);
			$module = "";
			$function;
			if(count($split) == 3) {
				$module = $split[1];
				$function = $split[2];		
			} else {
				$function = $split[1];
			}
			$function_split = explode("(", $function);
			$function = $function_split[0];
			
			$accessible = true;
			$current_module = $app;
			if($module != "") {
				$current_module = $app->$module;
			}
			if(isset($current_module->function_access)) {
				foreach($current_module->function_access as $access_group => $group_functions) {
					foreach($group_functions as $group_function) {
						if($group_function == $function) {
							if($app->_user_group_member($access_group) != 1) {
								$accessible = false;
							}
						}
					}
				}
			}
			if($accessible) {
				$statement = "return ".$statement;
				//var_dump($statement);
				$return = eval($statement);
				if(is_array($return)) {
					echo json_encode($return);	
				} else {
					echo $return;	
				}
			}
		}
	
	}