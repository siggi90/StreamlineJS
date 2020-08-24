<?

class cloud {
	private $sql;
	private $statement;
	private $user_id;
	private $app;
	
	public $function_access = array(
		'admin' => array(
			'cloud_api',
			'_user',
			'_user_group',
			'_settings',
			'_invite_key',
			'delete_*',
		)
	);
	
	function __construct($sql, $statement, $user_id, $app) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		$this->app = $app;
		
		$self = $this;
	}
	
	function connected() {
		return 1;	
	}
		
	function get_state() {
		return array(
			'user_group' => $this->app->highest_user_group()
		);	
	}
	
	function organization_apps_options() {
		$query = "SELECT id, name as value, name as image FROM app.apps WHERE category_id = 0";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['href'] = "/".strtolower($row['value'])."/";	
		}
		return $rows;
	}
	
	function web_apps_options() {
		$query = "SELECT id,  name as value, name as image FROM app.apps WHERE category_id = 1";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['href'] = "/".strtolower($row['value'])."/";	
		}
		return $rows;
	}
	
	function entertainment_apps_options() {
		$query = "SELECT id, name as value, name as image FROM app.apps WHERE category_id = 3";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['href'] = "/".strtolower($row['value'])."/";	
		}
		return $rows;
	}
	
	function mathematics_apps_options() {
		$query = "SELECT id, name as value, name as image FROM app.apps WHERE category_id = 2";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['href'] = "/".strtolower($row['value'])."/";	
		}
		return $rows;
	}
	
	function _invite_key($v) {
		$key = $this->app->generate_key();
		
		$v['value'] = $key;
		
		$this->statement->generate($v, "invite_keys");
		$this->sql->execute($this->statement->get());
		$id = $this->sql->last_id($v);	
		return $id;
	}
	
	function invite_keys_table($search_term, $offset) {
		$query = "(SELECT invite_keys.id as id, invite_keys.value as value, app._user_groups.name as group_name FROM invite_keys, app._user_groups WHERE invite_keys.user_group_id = app._user_groups.id)";
		$query .= " UNION (SELECT id, value, 'No Group' as group_name FROM invite_keys  WHERE user_group_id IS NULL)";
		$rows = $this->sql->get_rows($query, 1);	
		foreach($rows as $key => $row) {
			$rows[$key]['value'] = "<a href='/account/#sign_up#".$row['value']."'>".$row['value']."</a>";
		}
		
		return $rows;
	}
	
	function delete_invite_key($id) {
		$query = "DELETE FROM invite_keys WHERE id = ".$id;
		$this->sql->execute($query);
	}
	
	function get_user_group_select() {
		$query = "SELECT * FROM app._user_groups";
		$rows = $this->sql->get_rows($query, "1");
		$select_values = array(
			array('id' => '-1', 'title' => 'No Group')
		);
		foreach($rows as $row) {
			$select_value = array(
				'id' => $row['id'],
				'title' => $row['name']
			);	
			$select_values[] = $select_value;
		}
		return $select_values;
	}
	
	function user_groups_table($search_term='', $offset=0) {
		$query = "SELECT id, name, description FROM app._user_groups";
		if($search_term != '') {
			$query .= " WHERE (name LIKE '%".$search_term."%' OR description LIKE '%".$search_term."%')";	
		}
		//var_dump($query);
		return $this->sql->get_rows($query, 1);
	}
	
	function users_table($search_term='', $offset=0, $user_group_id="-1") {
		$query = "SELECT id, email FROM app.users";
		$where = true;
		if($user_group_id !== "-1") {
			$query = "SELECT id, email FROM app.users, app._user_user_groups WHERE app.users.id = app._user_user_groups.user_id AND app._user_user_groups.user_group_id = ".$user_group_id;
			$where = false;
		}
		if($search_term != '') {
			if($where) {
				$query .= " WHERE ";	
			} else {
				$query .= " AND ";	
			}
			$query .= " email LIKE '%".$search_term."%'";	
		}
		//var_dump($query);
		return $this->sql->get_rows($query, 1);
	}
	
	function get_user_group($id) {
		$query = "SELECT id, name, description FROM app._user_groups WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function delete_user_group($id) {
		$query = "DELETE FROM app._user_groups WHERE id = ".$id;
		return $this->sql->execute($query);	
	}
	
	function get_user($id) {
		$query = "SELECT id, email FROM app.users WHERE id = ".$id;
		$result = $this->sql->get_row($query, 1);	
		$query = "SELECT user_group_id FROM app._user_user_groups WHERE user_id = ".$id;
		$user_group_result = $this->sql->get_row($query, 1);
		if(isset($user_group_result['user_group_id'])) {
			$result['user_group_id'] = $user_group_result['user_group_id'];
		} else {
			$result['user_group_id'] = "-1";	
		}
		
		return $result;
	}
	
	function delete_user($id) {
		$query = "DELETE FROM app.users WHERE id = ".$id;
		return $this->sql->execute($query, NULL, true);	
	}

	function _user_group($v) {
		$this->statement->generate($v, "app._user_groups");
		$this->sql->execute($this->statement->get());
		$user_id = $this->sql->last_id($v);
		return $user_id;
	}
		
	function _user($v) {
		$user_group_id = $v['user_group_id'];
		unset($v['user_group_id']);
		/*$this->statement->generate($v, "app.users");
		$this->sql->execute($this->statement->get());
		$user_id = $this->sql->last_id($v);*/
		
		$user_id = $v['id'];
		
		$v = array(
			'user_id' => $user_id,
			'user_group_id' => $user_group_id
		);
		if($user_group_id != -1) {
			$query = "DELETE FROM app._user_user_groups WHERE user_id = ".$v['user_id'];
			$this->sql->execute($query);
			$this->statement->generate($v, "app._user_user_groups");
			$this->sql->execute($this->statement->get());	
		}
		return $user_id;
	}
	
	function email_validation($value, $id) {
		$query = "SELECT COUNT(*) as count FROM app.users WHERE email = '".$value."' AND id != ".$id;
		$count = $this->sql->get_row($query)['count'];
		return !($count > 0);	
	}
	
	function _settings($v) {
		/*$web_address = $v['web_address'];
		
		$server_id = $this->cloud_api(array(
			'action' => '_server',
			'address' => $web_address
		));
		
		$v['server_id'] = $server_id;
		if(!$server_id || $server_id == -1) {
			return -1;	
		}
		unset($v['id']);*/
		
		foreach($v as $key => $value) {
			$query = "DELETE FROM settings WHERE property = '".$key."'";
			$this->sql->execute($query);
			
			$values = array(
				'property' => $key,
				'value' => $value
			);
			$this->statement->generate($values, "settings");
			$this->sql->execute($this->statement->get());
		}
		return true;
	}
	
	function get_settings() {
		$query = "SELECT * FROM settings";
		$rows = $this->sql->get_rows($query, 1);	
		$result = array();
		foreach($rows as $row) {
			$result[$row['property']] = $row['value'];	
		}
		return $result;
	}
	
	function get_user_count() {
		$query = "SELECT COUNT(*) as count FROM app.users";	
		return $this->sql->get_row($query, 1);
	}
	
	
	function username_validation($username) {
		return $this->validate_email($username);	
	}
	
	function _init_admin($v) {
		$query = "SELECT COUNT(*) as count FROM app.users";
		$count = $this->sql->get_row($query, 1)['count'];
		if($count == 0) {
			$settings = array();
			$settings['team_name'] = $v['team_name'];
			$settings['web_address'] = $v['server_url'];
			$settings['server_id'] = $v['server_id'];
			unset($v['team_name']);
			unset($v['server_url']);
			unset($v['server_id']);
			unset($v['id']);
			
			$v['email'] = $v['username'];
			unset($v['username']);
			
				
			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get());
			
			var_dump($this->statement->get());
			
			$this->user_id = $this->sql->last_id($v);
			
			
			$result = $this->_settings($settings);
			return 1;
		}
		return 0;
	}
	
	/*function _init_admin($v) {
		$query = "SELECT COUNT(*) as count FROM app.users";
		$count = $this->sql->get_row($query, 1)['count'];
		
		//$count = 0;
				
		$settings = array();
		$settings['team_name'] = $v['team_name'];
		$settings['web_address'] = $v['web_address'];
		unset($v['team_name']);
		unset($v['web_address']);
		
		$password = $v['password'];
		//$token = $v['token'];
		//unset($v['token']);
		if($count == 0) {
			
			$v['user_id'] = $v['id'];
			
			unset($v['id']);
			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get());
			
			$this->user_id = $this->sql->last_id($v);
			//$_SESSION['api_token'] = $token;
			//var_dump($this->user_id);
			
			$result = $this->login_api($v['email'], $password);	
			
			
			$result = $this->_settings($settings);
						
			return 1;
		}
		return -1;
	}
	
	/*function _user($v) {
		$v['email'] = $v['username'];
		unset($v['username']);
		$this->statement->generate($v, "app.users");
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}*/
	
	function is_user($id) {
		if($this->user_id == $id) {
			return 1;	
		}
		return 0;
	}
}

?>