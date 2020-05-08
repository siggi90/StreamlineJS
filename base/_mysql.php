<?php

class mysql {
	
	private $username = 'root';
	private $password = '';
	private $server;
	private $db;
	private $skipun;	
	private $results;
	private $connection;
	
	
	function get_connection() {
		return $this->connection;	
	}
	
	private $servers = array(
		array(
			'username' => 'root',
			'password' => '',
			'server' => 'localhost'
		)
	);
	
	
	function mysql($db=NULL) {
		$this->db = $db;
		$this->results = NULL;
	}
	
	function setDb($d) {
		$this->db = $d;
	}
	
	private $user_id;
	
	function set_user($user_id) {
		$this->user_id = $user_id;
	}
	
	function __construct() {
		$this->connect();	
	}
	
	function connect()	{
		foreach($this->servers as $server) {
			try {
				$username = $this->username;
				$password = $this->password;
				if(isset($server['username'])) {
					$username = $server['username'];	
				}
				if(isset($server['password'])) {
					$password = $server['password'];	
				}
				$this->connection = mysqli_connect($server['server'], $username, $password);
				mysqli_select_db($this->connection, $this->db); 
			} catch(Exception $e) { 
				return false; 
			}
		}
	}
	
	function execute($query=NULL) {
		//if(!isset($this->connection)) {
			$this->connect();
		//}
		$results = mysqli_query($this->connection, $query);
		return $results;
	}
	
	
	public function get_rows($query, $result_type=NULL) {
		if($result_type == NULL) {
			$result_type = MYSQLI_BOTH;	
		} else if($result_type == 0) {
			$result_type = MYSQLI_NUM;	
		} else {
			$result_type = MYSQLI_ASSOC;	
		}
		$result = $this->execute($query);
		$return = array();
		while($row = mysqli_fetch_array($result, $result_type)) {
			array_push($return, $row);	
		}
		return $return;	
	}
	
	public function get_row($query, $result_type=NULL) {
		$rows = $this->get_rows($query, $result_type);
		if(count($rows) > 0) {
			return $rows[0];	
		} else {
			return [];
		}
	}
	
	function last_id($v=NULL) {
		$result = $this->last_id_sub($v);
		if($result == 0) {
			return -1;	
		}
		return $result;
	}
	
	function last_id_sub($v=NULL) {
		if($v != NULL) {
			if(isset($v['id']) && $v['id'] != "" && $v['id'] != -1) {
				return $v['id'];	
			}
		}
		return mysqli_insert_id($this->connection);	
	}
		
	function close() {
		mysqli_close($this->connection);
	}
	
	function replaceNonEnglish($strengur) {
		
	
	}

}


?>