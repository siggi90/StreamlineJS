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
	
	
	/*private $api_url = "https://www.noob.software/cloud_api/actions.php";
		
	function cloud_api($data = false) {
		$url = $this->api_url;
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_POST, 1);

		if($data) {
			curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
		}
	
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	
		$result = curl_exec($curl);
		curl_close($curl);
		return json_decode($result, true);
	}*/
	
	/*function _user($v) {
		try {
			if($this->user_id != -1) {
				$v['id'] = $this->user_id;	
			}
			if(isset($v['invite_key'])) {
				$query = "SELECT * FROM cloud.invite_keys WHERE value = '".$v['invite_key']."'";
				$row = $this->sql->get_row($query, 1);
				if($row == NULL) {
					return -1;	
				}
				$user_group_id = $row['user_group_id'];
				
				unset($v['invite_key']);
				
				
				$v_send = $v;
				$v_send['action'] = '_user';
				unset($v_send['id']);
				$query = "SELECT * FROM cloud.settings WHERE property = 'server_id'";
				$server_id = $this->sql->get_row($query, 1)['value'];
				$v_send['server_id'] = $server_id;
				
				$noob_user_id = $this->cloud_api($v_send);
				if($noob_user_id == -1) {
					return -1;	
				}
				$v['user_id'] = $noob_user_id;
				
				$this->statement->generate($v, "app.users");
				$this->sql->execute($this->statement->get());
				$user_id = $this->sql->last_id($v);	
				if($user_id != -1) {
					$this->user_id = $user_id;
					$_SESSION['user_id'] = $user_id;
					
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
				}
				return $user_id;
			} else if(isset($v['id'])) {
				$v_send = $v;
				$v_send['action'] = '_user';
				
				$query = "SELECT * FROM app.users WHERE user_id = ".$this->user_id;
				$user = $this->sql->get_row($query, 1);
				
				$v_send['id'] = $user['user_id'];
				unset($v['old_password']);
				//$v_send['old_password'] = $user['password'];
				
				$noob_user_id = $this->cloud_api($v_send);
				if(!$noob_user_id || $noob_user_id == -1) {
					return -1;	
				}
				
				$this->statement->generate($v, "app.users");
				$this->sql->execute($this->statement->get());
				$user_id = $this->sql->last_id($v);	
				if($user_id != -1) {
					$this->user_id = $user_id;
					$_SESSION['user_id'] = $user_id;
				}
				return $user_id;
			}
			return -1;
		} catch(Exception $e) {
			return -1;	
		}
	}*/

	function _user($v) {
		if(isset($v['invite_key'])) {
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