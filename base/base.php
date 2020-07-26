<?

class base {
	private $color;
	protected $user_id;
	protected $app_id;
	protected $project_root;
	protected $server_root;
	protected $statement;
	protected $sql;
	public $colors;
	protected $modules;
	
	function __construct($app_id=NULL, $project_root) {
		session_start();
		//echo "sess_id: ".session_id()."<br>";
		$this->app_id = $app_id;
		$this->project_root = $project_root;
		$this->server_root = $_SERVER["DOCUMENT_ROOT"]; //"/Volumes/Macintosh HD/Applications/XAMPP/xamppfiles/htdocs";
		$this->autoload();
		$this->sql = new mysql($app_id);
		/*if(!isset($_SESSION['user_id'])) {
			$this->get_session();
		}*/
		if(isset($_SESSION['user_id'])) {
			$this->set_user_id($_SESSION['user_id']);
		} else {
			$this->user_id = -1;
			$_SESSION['user_id'] = -1;	
			unset($_SESSION['user_id']);
		}
		$this->statement = statement::init($this->sql, $app_id, $this->user_id);
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
				// process the line read.
				if($counter > 0) {
					//$current_class = "";
					$pos = strpos($line, " new ");
					$end = strpos($line, "(", $pos);
					if($pos != false) {
						$class_name = substr($line, $pos+5, $end-($pos+5));
						if($class_name != "" && $class_name != "app" && $class_name != "self" && !$this->is_loaded($class_name) && !$this->is_excluded($class_name)) { //
							if($class_name != $current_class) {
								$classes[$class_name] = true;
								/*echo $line."<br>";
								echo "class: ".$class_name."<br>";*/
							}
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
								/*echo $line."<br>";
								echo "class: ".$class."<br>";
								echo "current_class: ".$current_class."<br>";*/
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
								/*echo $line."<br>";
								echo "class: ".$class_name."<br>";*/
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
			//echo '../base/'.$class.'.php';
			$path = "";
			if(file_exists('../base/'.$class.'.php')) {
				$path = '../base/'.$class.'.php';
				//require_once($path);	
			} else if(file_exists($this->server_root.$this->project_root.'/class/'.$class.'.php')) {
				$path = $this->server_root.$this->project_root.'/class/'.$class.'.php';
				//require_once($path);		
			} else {
				$path = $this->server_root.$this->project_root.'/'.$class.'.php';
				//require_once($path);
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
		$query = "SELECT * FROM app.users WHERE email = '".$par['username']."'";
		$row = $this->sql->get_row($query);
		if(count($row) > 0 && $row['email'] == $par['username'] && password_verify($par['password'], $row['password'])) {
			$this->set_user_id($row['id']);
			//$this->store_session();
			return $row['id'];	
		} else {
			return -1;	
		}
	}
	
	public function logout($v) {
		$_SESSION['user_id'] = -1;
		return -1;	
	}
	
	public function get_username($v) {
		$query = "SELECT email FROM app.users WHERE id = ".$this->user_id;
		$row = $this->sql->get_row($query);
		return $row['email'];
	}
	
	public function get_user_id($v) {
		if(isset($this->user_id)) {
			return $this->user_id;
		} else {
			return "-1";	
		}
	}
		
	protected function set_user_id($user_id) {
		$this->user_id = $user_id;
		$_SESSION['user_id'] = $user_id;
		/*foreach($this->modules as $module) {
			$statement = "$this->appstat->set_user_id(".$this->user_id.");";
			eval($statement);	
		}*/
		//$this->sql->set_user($this->user_id);
	}
	
	/*public function register($v) {
		$query = "SELECT COUNT(*) as count FROM users WHERE email = '".$v['email']."'";
		$count = $this->sql->get_row($query);
		$count = $count['count'];
		if($count == 0) {
			$query = "INSERT INTO users (email, password) VALUES('".$v['email']."', '".$v['password']."')";
			$this->sql->execute($query, true);
			$user_id = mysql_insert_id();
			$this->set_user_id($user_id);
			$this->user_init();
			return $user_id;
		}
		return -1;
	}*/
	
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
	
	public function get_app_state($id) {
		$query = "SELECT * FROM app.app_state WHERE app_id = '".$this->app_id."' AND user_id = ".$this->user_id;
		//$query = "SELECT * FROM app_state WHERE property = '".$id."'";
		//return json_encode(mysql_fetch_array($this->sql->execute($query), MYSQL_ASSOC));
		return $this->sql->json($query);
	}
	
	public function submit_app_state($v) {
		$app_state = json_decode($v['app_state']);
		//var_dump($app_state);
		foreach($app_state as $state) {
			$v = array();
			$v['property'] = $state->property;
			$v['value'] = $state->value;
			//echo "value: ".$v['value']."<br>";
			$this->set_app_state($v);	
		}
	}
	
	public function set_app_state($values) {
		//if($values['value'] != 'undefined') {
			$query = "DELETE FROM app.app_state WHERE app_id = '".$this->app_id."' AND property = '".$values['property']."' AND user_id = ".$this->user_id;
			$this->sql->execute($query);
			$query = "INSERT INTO app.app_state (property, value, app_id, user_id) VALUES('".$values['property']."', '".$values['value']."', '".$this->app_id."', ".$this->user_id.")";
			echo $query;
			$this->sql->execute($query);
		//}
	}
	
	public function assets() {
		return implode(" ", array($this->_js_index(), $this->html_assets()));	
	}
	
	private $html_assign;
	
	public function get_html($path) {
		$output = "";
		$dir = $this->server_root.$path;
		$files = scandir($dir);
		foreach($files as $file) {
			if(strpos($file, "html") !== false) {
				$location = $dir."/".$file;
				//array_push($this->html_assign, $path."/".$file);
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
		/*if(count($this->html_assign) > 0) {
			$output .= " var html_assets = [";
			$counter = 0;
			foreach($this->html_assign as $path) {
				$output .= ($counter > 0 ? ", " : "");
				$output .= "'".$path."'";	
				$counter++;
			}
			$output .= "]; ";
		}*/
		return $output;
	}
	
	private $root_assign;
	public function get_files($dir) {
		$output = " ";
		$files = scandir($dir);
		$files = array_reverse($files);
		foreach($files as $file) {
			if(strpos($file, "js") !== false && $file != "base.js") {
				$location = $dir."/".$file;
				$file = fopen($location, "r");
				$contents = fread($file, filesize($location));
				fclose($file);
				$path = substr($contents, 0, strpos($contents, "="));
				array_push($this->root_assign, $path);
				$output .= " ".$contents;
			} else if(strpos($file, "_") !== false && is_dir($dir."/".$file)) {
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
		
	
	/*public function print_colors() {
		$colors = $this->get_colors();
		$return_string = "";
		$return_string .= "[";
		foreach($colors as $color) {
			$return_string .= "'".$color."', ";	
		}
		$return_string .= "]";
		return $return_string;
	}*/
	
	public function get_apps($v) {
		$query = "SELECT * FROM app.apps WHERE disabled != 1 ORDER BY app_title";
		return $this->sql->json($query);	
	}
	
	
	public function home_panels($v) {
		$query = "SELECT * FROM app.home_panels WHERE user_id = ".$this->user_id;
		return $this->sql->json($query);	
	}
	
	public function home_panel($v) {
		//$this->set_user($v);
		//$statement = new statement($v, NULL, "app.home_panels");
		$this->statement->generate($v, NULL, "app.home_panels");
		$this->sql->execute($this->statement->get());
	}
	
	public function home_screen($v) {
		$query = "SELECT id FROM home_screen WHERE user_id = ".$this->user_id;
		$row = $this->sql->get_row($query);
		$id = $row['id'];
		$v['id'] = $id;
		$this->statement->generate($v);
		$this->sql->execute($this->statement->get());
		$query = "SELECT modified FROM home_screen WHERE id = ".$id;
		$row = $this->sql->get_row($query);
		return $row['modified'];
	}
	
	public function get_home_screen($modified) {
		$query = "SELECT modified FROM home_screen WHERE user_id = ".$this->user_id;
		$row = $this->sql->get_row($query);
		$last_modified = $row['modified'];
		if($modified != $last_modified) {
			return $this->home_panels(NULL);	
		}
		return json_encode(array());
	}
	
	function _user_group_member($group_name, $group_id=NULL) {
		if($this->user_id == -1) {
			return 0;	
		}
		if($group_id == NULL) {
			$query = "SELECT id FROM app.user_groups WHERE group_name = '".$group_name."'";
			$group_id = $this->sql->get_row($query)['id'];
		}
		if($group_name == NULL) {
			$query = "SELECT group_name FROM app.user_groups WHERE id = ".$group_id;
			$group_name = $this->sql->get_row($query)['id'];	
		}
		if(strtolower($group_name) == "users") {
			if($this->user_id != -1) {
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
	
}

class text {
	private $sql;
	private $app;
	
	function __construct($app) {
		$this->app = $app;
		$this->sql = new mysql("app");	
	}
	
	function get_app_id($name) {
		$query = "SELECT id FROM app WHERE app_title = '".$name."'";
		$row = $this->sql->get_row($query);
		return $row['id'];	
	}
	
	function new_text($tag) {
		$query = "INSERT INTO text (tag) VALUES('".$tag."')";
		$this->sql->execute($query);	
	}
}


/*class color {
	public function get_colors() {
		$colors = array();
		for($c_val = 0; $c_val < 30; $c_val += 5) { //10
			//for($c_val2 = 0; $c_val2 < 50; $c_val2 += 10) {
				for($c_val3 = 0; $c_val3 < 360; $c_val3 += 30) {
					$rgb = "hsl(".($c_val3+$c_val).", 60%, 50%)";	 //c_val2
					array_push($colors, $rgb);
				}
			//}
		}
		//background-color:hsl(9, 100%, 64%);
		return $colors;
	}
	
	public function print_colors() {
		$colors = $this->get_colors();
		echo "[";
		foreach($colors as $color) {
			echo "'".$color."', ";	
		}
		echo "]";
	}	
}*/

?>