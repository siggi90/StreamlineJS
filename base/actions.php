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
		//$_POST = $_REQUEST;
		unset($_POST['action']);
		$app = new app();
		
		//if(isset($require_token) && $require_token === true && isset($app->cloud_api)) {
		if(isset($app->cloud_api) && isset($_POST['_api_user_id'])) {
			$app->cloud_api->verify_token($_POST['_api_user_id'], $_POST['_api_token']);
			unset($_POST['_api_user_id']);
			unset($_POST['_api_token']);
		}
		
		//echo $app->test();
		//var_dump($_POST);
		
		$connection =  $app->get_connection();//mysqli_connect('localhost', 'root', '');

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
		
		function clean_var($var, $connection) {
			if(is_array($var)) {
				foreach($var as $key => $value) {
					$var[$key] = clean_var($var[$key], $connection);
				}
			} else {
				return mysqli_escape_string($connection, $var);	
				//return $var;
			}
			return $var;
		}
		
		$action_last_character = substr(strrev($action), 0, 1);

		foreach($_POST as $key => $value) {
			$_POST[$key] = json($_POST[$key]);
			if($action_last_character != "_") {
				$_POST[$key] = clean_var($_POST[$key], $connection);
			}
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
				} else {
					if(strpos($action, "_set_order") !== false) {
						$set_order_split = explode("_set_order", $action)[0];
						$action = "set_order";
						$_POST['connect_value'] = $set_order_split;
						$statement = class_method($module, $action, $app, $post_flag);
					} else if(isset($app->$module->items)) {
						$found = false;
						$item_id = NULL;
						foreach($app->$module->items as $item) {
							$item_id_value = $item->item_table;
							if(!$found) {
								if(strpos($action, $item_id_value) !== false) {
									$action = str_replace($item_id_value, "!", $action);
									$item_id = $item_id_value;
									$found = true;	
								}
							}
							$item_id_value_id = $item->item_id;
							if(!$found) {
								if(strpos($action, $item_id_value_id) !== false) {
									$action = str_replace($item_id_value_id, "!", $action);
									$item_id = $item_id_value;
									$found = true;	
								}
							}
						}
						if($found) {
							$item_split = explode("_", $action);
							//var_dump($item_split);
							//$item_id = $item_split[0];
							/*if($item_split[0] == 'get' || $item_split[0] == '') {
								$item_id = $item_split[1];
								unset($item_split[1]);	
							} else {
								unset($item_split[0]);
							}*/
							foreach($item_split as $key => $value) {
								if($value == "!") {
									unset($item_split[$key]);
								}
							}
							//var_dump($item_id);
							/*foreach($app->$module->items as $item) {
								if($item->item_id == $item_id) {
									$item_id = $item->item_table;	
								}
							}*/
							if(isset($app->$module->items[$item_id])) {
								$sub_action = implode("_", $item_split);
								//var_dump($sub_action);
								//var_dump($sub_action);
								if($sub_action == "list") {
									$sub_action .= "_";	
								} else if($sub_action == "") {
									$sub_action = "_";	
								}
								//echo "sub_action";
								if(method_exists($app->$module->items[$item_id], $sub_action)) {
									$module_value = $module.'->items["'.$item_id.'"]';
									$statement = class_method($module_value, $sub_action, $app, $post_flag);
								}
							}
						}
					}
				}
			}
			//var_dump($statement);
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
							if($access_group == "inaccessible" || $app->_user_group_member($access_group) != 1) {
								$accessible = false;
							}
						} else if(strpos($group_function, "*") !== false) {
							if($group_function == "*") {
								if($app->_user_group_member($access_group) != 1) {
									$accessible = false;
								}
							} else {
								$split = explode('*', $group_function)[0];
								if(strpos($function, $split) === 0) {
									if($app->_user_group_member($access_group) != 1) {
										$accessible = false;
									}	
								}
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
			} else {
				echo "-2";	
			}
		}
	
	}