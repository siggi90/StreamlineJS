<?

class account {
	private $sql;
	private $statement;
	private $user_id;
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
	}
	
	function get_state() {
		return array();	
	}
	
	function downloads_table($search_term, $offset) {
		$query = "SELECT downloads.id as id, app.apps.name as image, downloads.title as title, downloads.description as description, href FROM downloads, app.apps WHERE downloads.app_id = app.apps.id";	
		return $this->sql->get_rows($query, 1);
	}
	
	function web_applications_table($search_term, $offset) {
		$query = "SELECT web_applications.id as id, app.apps.name as image, web_applications.title as title, web_applications.description as description, href FROM web_applications, app.apps WHERE web_applications.app_id = app.apps.id";	
		return $this->sql->get_rows($query, 1);
	}
	
	function email_validation($value) {
		$query = "SELECT COUNT(*) as count FROM app.users WHERE email = '".$value."'";
		$count = $this->sql->get_row($query)['count'];
		return !($count > 0);	
	}
	
	function _user($v) {
		$continue = true;
		if(isset($v['token'])) {
			$secret_key = "your-key-here";
			$url = 'https://www.google.com/recaptcha/api/siteverify';
			$data = array('secret' => $secret_key, 'response' => $v['token']);
			
			unset($v['token']);
			
			$options = array(
				'http' => array(
			  	'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			  	'method'  => 'POST',
			  	'content' => http_build_query($data)
			)
			);
			$context  = stream_context_create($options);
			$response = file_get_contents($url, false, $context);
			$response_keys = json_decode($response,true);
			if($response_keys["success"]) {
				$continue = true;
			}
		}
		if($this->user_id != -1) {
			$v['id'] = $this->user_id;
			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get());
			$user_id = $this->sql->last_id($v);	
			return $user_id;
		} else if(isset($v['invite_key']) && $continue) {
			$query = "SELECT * FROM cloud.invite_keys WHERE value = '".$v['invite_key']."'";
			$row = $this->sql->get_row($query, 1);
			if($row == NULL) {
				return -1;	
			}
			$user_group_id = $row['user_group_id'];
			
			unset($v['invite_key']);
			
			
			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get());
			$user_id = $this->sql->last_id($v);	
			
			if($user_id != -1) {
				$v = array(
					'user_id' => $user_id,
					'user_group_id' => $user_group_id
				);
				$this->statement->generate($v, "app._user_user_groups");
				$this->sql->execute($this->statement->get());	
				
					
				$this->user_id = $user_id;
				$_SESSION['user_id'] = $user_id;
			}
		}
	}
	
	function get_sign_up($id) {
		$query = "SELECT * FROM cloud.invite_keys WHERE value = '".$id."'";
		$row = $this->sql->get_row($query, 1);
		if($row == NULL) {
			return array(
				'access' => '-1'
			);	
		}
		$query = "SELECT * FROM cloud.settings WHERE property = 'server_id'";
		$server_id = $this->sql->get_row($query, 1)['value'];
		return array(
			'access' => '1',
			'user_group_id' => $row['user_group_id'],
			'server_id' => $server_id
		);
	}
}

?>