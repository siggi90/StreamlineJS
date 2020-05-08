<?php

class mysql {
	
	private $username = 'sigurdurjokull';
	private $password = 'nextstepgwaryarr';
	private $server;
	private $db;
	private $skipun;	
	private $results;
	private $connection;
	
	
	private $servers = array(
		array(
			'username' => 'root',
			'password' => '',
			'server' => 'localhost'
		)/*, array(
			'server' => '192.168.1.4'
		),*/
	);
	
	
	function mysql($db=null, $server="localhost", $username="root") {
		/*$this->username = "root";
		$this->password = "";
		$this->server = "localhost";*/
		$this->db = $db;
		$this->results = null;
	}
	
	function setDb($d) {
		$this->db = $d;
	}
	
	private $user_id;
	
	function set_user($user_id) {
		$this->user_id = $user_id;
	}
	
	function connect()	{
		$this->connection = array();
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
				//echo $server['server']."<br>";
				array_push($this->connection, mysql_connect($server['server'], $username, $password));
				mysql_select_db($this->db, $this->connection[count($this->connection)-1]); 
			} catch(Exception $e) { 
				return false; 
			}
		}
	}
	
	function execute($query=NULL) {
		$this->connect();
		//$split = explode(" ", $query);
		/*if($split[0] == "INSERT" || $split[0] == "UPDATE") {
			$results;
			$counter = 0;
			foreach($this->connection as $connection) {
				$results = mysql_query($query, $connection);
				//echo "conn: ".$counter."<br>";
				$counter++;
			}
			return $results;	
		} else {		*/
			$results = mysql_query($query, $this->connection[0]);
			return $results;
		//}
	}
	
	
	public function get_rows($query, $result_type=NULL) {
		if($result_type == NULL) {
			$result_type = MYSQL_BOTH;	
		} else if($result_type == 0) {
			$result_type = MYSQL_NUM;	
		} else {
			$result_type = MYSQL_ASSOC;	
		}
		$result = $this->execute($query);
		$return = array();
		while($row = mysql_fetch_array($result, $result_type)) {
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
		return mysql_insert_id($this->connection[0]);	
	}
	
	/*function __destruct() {
		$this->close();	
	}*/

	/*function get_rows($skipun=null) {
		if($skipun != null) {
			$this->skipun = $skipun;
		}
		if($this->results == null) {
			$this->execute();
		}
		return mysql_fetch_array($this->results, MYSQL_NUM);
	}*/
	
	function close() {
		mysql_close($this->connection[0]);
	}
	
	function replaceNonEnglish($strengur) {
		
	
	}

}


?>