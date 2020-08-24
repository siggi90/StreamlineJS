<?
ini_set('session.cookie_lifetime', 0);

include 'config.php';

class base {
	private $color;
	protected $user_id;
	protected $app_id;
	protected $project_root;
	protected $server_root;
	protected $statement;
	protected $sql; //
	public $colors;
	protected $modules;
	public $login_callbacks = array();
	
	function __construct($app_id=NULL, $project_root) {
		@session_start();
		$this->app_id = $app_id;
		$this->project_root = $project_root;
		$this->server_root = $_SERVER["DOCUMENT_ROOT"]; 
		$this->autoload();
		if(isset($_SESSION['user_id'])) {
			$this->set_user_id($_SESSION['user_id']);
		} else {
			$this->user_id = -1;
			$_SESSION['user_id'] = -1;	
			unset($_SESSION['user_id']);
		}
		$this->sql = new mysql($app_id);
		$this->statement = statement::init($this->sql, $app_id, $this->user_id);
	}
	
	function get_connection() {
		return $this->sql->get_connection();	
	}
	
	private $access_key_digits;
	
	function generate_key() {
		$this->access_key_digits = range(0, 9);
		$this->access_key_digits = array_merge($this->access_key_digits, range("a", "z"));
		$this->access_key_digits = array_merge($this->access_key_digits, range("A", "Z"));
		$length = 50;
		$counter = 0;
		$result = [];
		while($counter < $length) {
			$result[] = $this->access_key_digits[rand(0, count($this->access_key_digits)-1)];
			$counter++;	
		}
		return implode("", $result);
	}
	
	
	function get_definition() {
		$definition_location = $this->server_root.$this->project_root."/app/definition.js";
		if(file_exists($definition_location)) {
			$handle = fopen($definition_location, "r");
			$line_count = 0;
			$object_value = "";
			if($handle) {
				while(($line = fgets($handle)) !== false) {
					if($line_count > 0 && trim($line) != ";") {
						//var_dump($line);
						$object_value .= "".$line;	
					}
					$line_count++;
				}
			}
			fclose($handle);
			return $object_value;
		}
		return NULL;
	}
	
	public function store_session() {
		$query = "DELETE FROM app.session WHERE sess_id = '".session_id()."'"; //$_COOKIE['PHPSESSID']
		$this->sql->execute($query);
		$query = "DELETE FROM app.session WHERE user_id = ".$this->user_id.""; //$_COOKIE['PHPSESSID']
		$this->sql->execute($query);
		$query = "INSERT INTO app.session (sess_id, user_id) VALUES('".session_id()."', ".$this->user_id.")";
		$this->sql->execute($query);
	}
	
	public function get_sess_id() {
		return $_COOKIE['PHPSESSID'];	
	}
	
	public function get_session() {
		$query = "SELECT * FROM app.session WHERE sess_id = '".session_id()."'";
		$user_id = $this->sql->get_row($query)['user_id'];
		if($user_id != "") {
			$_SESSION['user_id'] = $user_id;	
			return $_SESSION['user_id'];
		}
		return "";
	}
	
	public function set_var($var, $index) {
		if(isset($var[$index])) {
			return $var[$index];	
		}
		return NULL;
	}
	
	public function fun_exists($method) {
		return method_exists(__CLASS__, $method);	
	}
	
	function test_fun() {
		return "test";	
	}
	
	public function print_arr($arr) {
		foreach($arr as $key => $value) {
			echo $key.": ".$value."<br>";	
		}
	}
	
	private function class_terminating($rev_line) {
		for($i=0; $i<strlen($rev_line); $i++) {
			$char = substr($rev_line, $i, 1);
			if(!ctype_alpha($char) && $char != "_") {
				return $i;	
			}
		}
		return strlen($rev_line);
	}
	
	private $loaded_classes = array();
	
	private function is_loaded($class) {
		$is_loaded = false;
		foreach($this->loaded_classes as $loaded) {
			if($loaded == $class) {
				$is_loaded = true;	
			}
		}
		return $is_loaded;
	}
	
	private $exclude_list = array(
		'DateTime',
		'ErrorException'
	);
	
	private function is_excluded($class_name) {
		if(in_array($class_name, $this->exclude_list)) {
			return true;
		}
		return false;
	}
	
	private $extended_directories = array(
		'cloud_api'
	);
	
	private function autoload($files=NULL) {
		if($files == NULL) {
			$files = get_included_files();
		}
		$classes = array();
		
		foreach($files as $file) {
			$handle = fopen($file, "r");
			$counter = 0;
			$current_class = explode("/", $file);
			$current_class = explode(".php", $current_class[count($current_class)-1])[0];
			
			while(($line = fgets($handle)) !== false) {
				if($counter > 0) {
					$pos = strpos($line, " new ");
					$end = strpos($line, "(", $pos);
					if($pos != false) {
						$class_name = substr($line, $pos+5, $end-($pos+5));
						if($class_name != "" && $class_name != "app" && $class_name != "self" && !$this->is_loaded($class_name) && !$this->is_excluded($class_name)) { //
							if($class_name != $current_class) {
								$classes[$class_name] = true;							}
						}
					}
					
					$pos = strpos($line, "::");
					if($pos != false) {
						$rev_pos = strlen($line) - $pos;
						$rev_line = strrev($line);
						$rev_line = substr($rev_line, $rev_pos);
						$end = $this->class_terminating($rev_line);
						$rev_class = substr($rev_line, 0, $end);
						$class = strrev($rev_class);
						if($class != "" && $class != "app" && $class != "parent" && !$this->is_excluded($class_name)) {
							if($class != $current_class) {
								$classes[$class] = true;
							}
						}
					}
					
					$pos = strpos($line, " extends ");
					$end = strpos($line, "{", $pos);
					if($pos != false) {
						$class_name = substr($line, $pos+9, $end-($pos+9));
						$class_name = trim($class_name);
						if($class_name != "" && $class_name != "app" && $class_name != "base" && !$this->is_loaded($class_name) && !$this->is_excluded($class_name)) { //
							if($class_name != $current_class) {
								$classes[$class_name] = true;
							}
						}	
					}
					
				}
				$counter++;
			}
			fclose($handle);
		}
		
		$autoload = array();
		foreach($classes as $class => $active) {
			array_push($this->loaded_classes, $class);
			$path = "";
			if(file_exists('../base/'.$class.'.php')) {
				$path = '../base/'.$class.'.php';
			} else if(file_exists($this->server_root.$this->project_root.'/class/'.$class.'.php')) {
				$path = $this->server_root.$this->project_root.'/class/'.$class.'.php';
			} else {
				foreach($this->extended_directories as $extended_directory) {
					if(file_exists('../'.$extended_directory.'/class/'.$class.'.php')) {
						$path = '../'.$extended_directory.'/class/'.$class.'.php';
					}
				}
			}
			array_push($autoload, $path);
		}	
		if(count($autoload) > 0) {
			$this->autoload($autoload);
		}
		
		foreach($autoload as $class) {
			require_once($class);
		}
	}
	
	public function login($par) {
		try {
			$query = "SELECT * FROM app.users WHERE email = '".$par['username']."'";
			$row = $this->sql->get_row($query, 1, NULL, true);
			if(count($row) > 0 && $row['email'] == $par['username'] && password_verify($par['password'], $row['password'])) {
				$this->set_user_id($row['id']);
				foreach($this->login_callbacks as $login_callback) {
					$login_callback($par['username'], $par['password']);	
				}
				return $row['id'];	
			} else {
				return -1;	
			}
		} catch(Exception $e) {
			return -1;	
		}
	}
	
	public function logout($v) {
		$_SESSION['user_id'] = -1;
		return -1;	
	}
	
	public function get_username($v) {
		$query = "SELECT email FROM app.users WHERE id = ".$this->user_id;
		$row = $this->sql->get_row($query, 1, NULL, true);
		return $row['email'];
	}
	
	public function get_user_id($v) {
		if(isset($this->user_id)) {
			return $this->user_id;
		} else {
			return "-1";	
		}
	}
		
	public function set_user_id($user_id) {
		$this->user_id = $user_id;
		$_SESSION['user_id'] = $user_id;
	}
	
	function validate_email($email) {
		if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			return false;
		}
		return true;
	}
	
	function validate_url($url) {
		if (!preg_match("/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i",$url)) {
			return false;
		}
		return true;
	}
	
	private function user_init() {
			
	}
	
	public function get_app_state() {
		$query = "SELECT property, value FROM app.app_state WHERE app_id = '".$this->app_id."' AND user_id = ".$this->user_id;
		return $this->sql->get_rows($query);
	}
	
	public function submit_app_state($app_state) {
		foreach($app_state as $state) {
			$v = array();
			$v['property'] = $state->property;
			$v['value'] = $state->value;
			$this->set_app_state($v);	
		}
	}
	
	public function set_app_state($values) {
		$query = "DELETE FROM app.app_state WHERE app_id = '".$this->app_id."' AND property = '".$values['property']."' AND user_id = ".$this->user_id;
		$this->sql->execute($query);
		$query = "INSERT INTO app.app_state (property, value, app_id, user_id) VALUES('".$values['property']."', '".$values['value']."', '".$this->app_id."', ".$this->user_id.")";
		$this->sql->execute($query);
	}
	
	public function assets() {
		return implode(" ", array($this->_js_index()));	//, $this->html_assets()
	}
	
	private $html_assign;
	
	public function get_html($path) {
		$output = "";
		$dir = $this->server_root.$path;
		$files = scandir($dir);
		foreach($files as $file) {
			if(strpos($file, "html") !== false) {
				$location = $dir."/".$file;
				$asset_index = substr($file, 0, strpos($file, ".html"));
				$file = fopen($location, "r");
				$contents = fread($file, filesize($location));
				$contents = addslashes($contents);
				$contents = trim(preg_replace('/\s+/', ' ', $contents));
				$output .= "app.content.html.html_data['".$asset_index."'] = \"".$contents."\"; ";
				fclose($file);
			}
		}
		return $output;
	}
	
	public function html_assets() {
		$output = " ";
		$this->html_assign = array();
		$output .= $this->get_html($this->project_root."/html");
		$output .= $this->get_html("/html");
		return $output;
	}
	
	private $root_assign;
	public function get_files($dir) {
		$output = " ";
		$files = scandir($dir);
		$files = array_reverse($files);
		foreach($files as $file) {
			$prefix = substr($file, 0, 1);
			if($prefix != "." && strpos($file, "js") !== false && $file != "base.js") {
				$location = $dir."/".$file;
				$file = fopen($location, "r");
				$contents = fread($file, filesize($location));
				fclose($file);
				$path = substr($contents, 0, strpos($contents, "="));
				array_push($this->root_assign, $path);
				$output .= " ".$contents;
			} else if($prefix != "." && strpos($file, "_") !== false && is_dir($dir."/".$file)) {
				$output .= $this->get_files($dir . DIRECTORY_SEPARATOR . $file);	
			}
		}
		return $output;
	}
							
	public function _js_index($filename=null) {
		$this->root_assign = array();
		$output = $this->get_files($this->server_root."/app");
		$output .= $this->get_files($this->server_root.$this->project_root."/app");
		if(count($this->root_assign) > 0) {
			$output .= " var root_assign = [";
			$counter = 0;
			foreach($this->root_assign as $path) {
				$output .= ($counter > 0 ? ", " : "");
				$output .= "'".$path."'";	
				$counter++;
			}
			$output .= "];";
		}
		return $output;
	}
	
	public function set_user(&$values) {
		$values['user_id'] = $this->user_id;	
	}
	
	public function get_apps($v) {
		$query = "SELECT * FROM app.apps WHERE disabled != 1 ORDER BY app_title";
		return $this->sql->json($query);	
	}
	
	function _user_group_member($group_name, $group_id=NULL) {
		$group_name = strtolower($group_name);
		if($this->user_id == -1) {
			return 0;	
		}
		if($group_id == NULL) {
			$query = "SELECT id FROM app.user_groups WHERE LOWER(group_name) = '".$group_name."'";
			$group_id = $this->sql->get_row($query)['id'];
		}
		if($group_name == NULL) {
			$query = "SELECT group_name FROM app.user_groups WHERE id = ".$group_id;
			$group_name = $this->sql->get_row($query)['id'];	
		}
		if(strtolower($group_name) == "users") {
			if(!isset($this->user_id)) {
				return 0;
			} else if($this->user_id != -1) {
				return 1;	
			}
		} else {
			$query = "SELECT COUNT(*) as count FROM app.user_user_groups WHERE user_id = ".$this->user_id." AND user_group_id = ".$group_id;
			$count = $this->sql->get_row($query)['count'];	
			if($count > 0) {
				return 1;	
			}
		}
		$query = "SELECT parent_group_id FROM app.user_groups WHERE id = ".$group_id;
		$group_id = $this->sql->get_row($query)['parent_group_id'];
		if($group_id == NULL) {
			return 0;	
		}
		if($group_id != -1) {
			return $this->_user_group_member(NULL, $group_id);
		}
	}
	
	function highest_user_group() {
		$user_groups = array();
		$id = 1;
		while($id != -1) {
			$query = "SELECT * FROM app.user_groups WHERE id = ".$id;
			$user_group = $this->sql->get_row($query, 1);
			$user_groups[] = $user_group;
			$id = $user_group['parent_group_id'];
		}
		
		$query = "SELECT user_group_id FROM app.user_user_groups WHERE user_id = ".$this->user_id;
		$groups = $this->sql->get_rows($query, 1);
		$highest_group = NULL;
		
		foreach($groups as $group) {
			foreach($user_groups as $key => $user_group) {
				if($group['user_group_id'] == $user_group['id'] && ($highest_group === NULL || $key > $highest_group)) {
					$highest_group = $key;	
				}
			}
		}
		if($highest_group === NULL) {
			return "user";	
		}
		return strtolower($user_groups[$highest_group]['group_name']);	
	}
	
}

?>