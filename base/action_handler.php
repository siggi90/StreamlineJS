<?

class action_handler {
	
	function __construct() {

	}


	function class_method($module, $action, $app, $post_flag=false, $item_id=NULL) {
		$statement = array();
		$statement['module'] = array();
		if($module != NULL) {
			$statement['module'][] = $module;
		}
		$statement['action'] = $action;
		$statement['post_flag'] = $post_flag;
		if($item_id != NULL) {
			$statement['module'][] = 'items';
			$statement['item_id'] = $item_id;
		}
		return $statement;
	}

	function find_module($action, $app, $modules, $post_flag=false) {
		$statement = array();
		foreach($modules as $module) {
			$if_statement = "return method_exists(\$app->".$module.", '".$action."');";
			if(method_exists($app->$module, $action)) {
				$statement = $this->class_method($module, $action, $app, $post_flag);
			} else {
				if(strpos($action, "_set_order") !== false) {
					$set_order_split = explode("_set_order", $action)[0];
					$action = "set_order";
					$this->post_data['connect_value'] = $set_order_split;
					$statement = $this->class_method($module, $action, $app, $post_flag);
				} else if(isset($app->$module->items)) {
					$found = false;
					$item_id = NULL;
					
					$items_list = $app->$module->items;
					foreach($items_list as $item_key => $item) {
						$item_id_value = $item->item_table;
						$item_id_singular = substr($item->item_table, 0, -1);
						$item_id_value_id = $item->item_id;
						
						if(!$found && isset($item->alias)) {
							foreach($item->alias as $alias) {
								if(strpos($action, $alias) !== false) {
									$action = str_replace($alias, "!", $action);
									$item_id = $item_key;
									$found = true;
								}	
							}
						}
						if(!$found) {
							if(strpos($action, $item_id_value) !== false) {
								$action = str_replace($item_id_value, "!", $action);
							
								$item_id = $item_key;
								$found = true;
							}
						}
						if(!$found) {
							if(strpos($action, $item_id_value_id) !== false) {
								$action = str_replace($item_id_value_id, "!", $action);
								
								$item_id = $item_key;
								$found = true;
							}
						}
						if(!$found) {
							if(strpos($action, $item_id_singular) !== false) {
								$action = str_replace($item_id_singular, "!", $action);
							
								$item_id = $item_key;
								$found = true;
							}
						}
					}
					if($found) {
						$item_split = explode("_", $action);
						foreach($item_split as $key => $value) {
							if($value == "!") {
								unset($item_split[$key]);
							}
						}
						
						$sub_action = implode("_", $item_split);
						if($sub_action == "list") {
							$sub_action .= "_";	
						} else if($sub_action == "") {
							$sub_action = "_";	
						}
						$this->post_data_gather_actions = array(
							'table'
						);
						
						if(in_array($sub_action, $this->post_data_gather_actions)) {
							$id_found = false;
							$this->post_data_values = array();
							foreach($this->post_data as $post_key => $post_value) {
								if(strpos($post_key, "_id") == strlen($post_key)-3) {
									if($id_found) {
										$this->post_data_values[$post_key] = $post_value;
										unset($this->post_data[$post_key]);
									} else {
										$id_found = true;	
									}
								}
							}
							if(count($this->post_data_values) != 0) {
								$this->post_data['post_data'] = $this->post_data_values;
							}
						}
						
						if(method_exists($app->$module->items[$item_id], $sub_action)) {
							$statement = $this->class_method($module, $sub_action, $app, $post_flag, $item_id);
						}
					}
				}
			}
		}
		return $statement;
	}

	function json($var) {
		if(is_array($var)) {
			return $var;	
		}
		$json = json_decode($var, true);
		if(is_array($json)) {
			return $json;	
		}
		return $var;
	}
	
	function clean_var($var, $connection) {
		if(is_array($var)) {
			foreach($var as $key => $value) {
				$var[$key] = $this->clean_var($var[$key], $connection);
			}
		} else {
			return mysqli_escape_string($connection, $var);	
		}
		return $var;
	}
	
	private $post_data;

	public function handle_action($modules, $class_prefix, $post_data, $set_app=NULL) {
		$this->post_data = $post_data;
		$statement = array();
		$action = $this->post_data['action'];
		//$this->post_data = $_REQUEST;
		unset($this->post_data['action']);
		//unset($_REQUEST['action']);
		$app;
		if($set_app === NULL) {
			if(class_exists("app")) {
				$app = new app();
			} else {
				/*$app_statement = '$app = new '.$class_prefix.'_app();';
				eval($app_statement);*/
				switch($class_prefix) {
					case 'housekeeping':
						$app = new housekeeping_app();
						break;
					/*'funds':
						$app = new funds_app();
						break;*/
					case 'objectives':
						$app = new objectives_app();
						break;
					case 'solutions':
						$app = new solutions_app();
						break;
				}	
			}
		} else {
			$app = $set_app;
		}
		
		//if(isset($require_token) && $require_token === true && isset($app->cloud_api)) {
		/*if(isset($app->cloud_api) && isset($this->post_data['_api_user_id'])) {
			$app->cloud_api->verify_token($this->post_data['_api_user_id'], $this->post_data['_api_token']);
			unset($this->post_data['_api_user_id']);
			unset($this->post_data['_api_token']);
		}*/
		
		//echo $app->test();
		//var_dump($this->post_data);
		
		$connection =  $app->get_connection();//mysqli_connect('localhost', 'root', '');

		
		$action_last_character = substr(strrev($action), 0, 1);

		foreach($this->post_data as $key => $value) {
			$this->post_data[$key] = $this->json($this->post_data[$key]);
			if($action_last_character != "_") {
				$this->post_data[$key] = $this->clean_var($this->post_data[$key], $connection);
			}
		}
		
		$module = "";
		if(isset($this->post_data['module'])) {
			$module = $this->post_data['module'];
			unset($this->post_data['module']);
		}
		
		
		
		
		if($module != "") {
			if(substr($action, 0, 1) == '_') {
				$if_statement = "return method_exists(\$app->".$module.", '".$action."');";
				if(method_exists($app->$module, $action)) {
					$statement = array(
						'module' => array($module),
						'action' => $action,
						'post_flag' => true
					);
				}
			} else {
				$statement = $this->class_method($module, $action, $app);
			}
		} else {
			if(substr($action, 0, 1) == '_') {
				$if_statement = "return method_exists(\$app, '".$action."');";
				if(method_exists($app, $action)) {
					$statement = $this->class_method(NULL, $action, $app);
				} else {
					$statement = $this->find_module($action, $app, $modules, true);
				}
			} else {
				$if_statement = "return method_exists(\$app, '".$action."');";
				if(method_exists($app, $action)) {
					$statement = array(
						'module' => array(),
						'action' => $action,
						'post_flag' => true
					);
				} else {
					$statement = $this->find_module($action, $app, $modules);
				}
			}
		}
		$current_module;
		if(count($statement) > 0) {
			$split = $statement['module'];
			$current_module = $app;
			$function;
			foreach($split as $module_value) {
				$current_module = $current_module->$module_value;
				if($module_value == 'items') {
					$current_module = $current_module[$statement['item_id']];
				}
			}
			$function = $statement['action'];
			
			$accessible = true;
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
				$return;
				$callback_array = array("app");
				foreach($statement['module'] as $module_part) {
					$callback_array[] = $module_part;
				}
				$callback_array[] = $statement['action'];
				if(!$statement['post_flag']) {
					$send = array();
					foreach($this->post_data as $post_value) {
						$send[] = $post_value;
					}

					$return = call_user_func_array(array($current_module, $statement['action']), $send);
				} else {
					$return = call_user_func_array(array($current_module, $statement['action']), array($this->post_data));
				}

				if(is_array($return)) {
					return json_encode($return);	
				} else {
					return $return;	
				}
			} else {
				return "-2";	
			}
		}
	}
}

?>