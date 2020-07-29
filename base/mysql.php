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
		return $this->connection[0];	
	}
	
	private $servers = array(
		array(
			 'username' => 'root',
			'password' => '',
			'server' => 'localhost'
		)/*, array(
			'server' => '192.168.1.4'
		),*/
	);
	
	private $id_server;
	
	/*
		clusters, skipta serverum i seperate clusters og redirecta notendum a rett cluster med load balancing
	*/
	
	function generate_id_table() {
		$query = "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT LIKE '%_schema%' AND table_schema != 'phpmyadmin'";
		$rows = $this->get_rows($query, 1);
		foreach($rows as $row) {
			$query = "SELECT id FROM ".$row['table_schema'].".".$row['table_name']." ORDER BY id DESC LIMIT 1";
			$id = $this->get_row($query)['id'];
			if($id != NULL) {
				$query = "INSERT INTO app.ids (table_name, table_id) VALUES('".$row['table_schema'].".".$row['table_name']."', ".$id.")";
				$this->execute($query, $this->id_server);	
			}
		}
	}
	
	function get_id($table_name) {
		$this->execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;", $this->id_server);
		$this->execute("BEGIN;", $this->id_server);
		$query = "SELECT * FROM app.ids WHERE table_name = '".$table_name."' FOR UPDATE;";
		$table_id = $this->get_row($query, 1, $this->id_server)['table_id'];
		$table_id++;
		$query = "UPDATE app.ids SET table_id = ".$table_id." WHERE table_name = '".$table_name."'";
		$this->execute($query, $this->id_server);
		$this->execute("COMMIT;", $this->id_server);
		return $table_id;
	}
	
	
	function __construct($db=NULL, $username="root", $password="", $server="localhost") {
		$this->db = $db;
		$this->results = NULL;
		
		$this->username = $username;
		$this->password = $password;
		
		$this->connect();
		$this->id_server = $this->connection[0];

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
				array_push($this->connection, mysqli_connect($server['server'], $username, $password));
				mysqli_select_db($this->connection[count($this->connection)-1], $this->db); 
			} catch(Exception $e) { 
				return false; 
			}
		}
	}
	
	function execute($query=NULL, $connection=NULL) {
		$split = explode(' ', trim($query));
		if($connection === NULL && ($split[0] == "INSERT" || $split[0] == "UPDATE")) {
			$result;
			$counter = 0;
			foreach($this->connection as $connection) {
				$result = mysqli_query($connection, $query);
				$counter++;
			}
			return $result;	
		} else {	
			if($connection === NULL) {
				$connection = $this->connection[0];	
			}
			$result = mysqli_query($connection, $query);
			return $result;
		}
	}
	
	
	public function get_rows($query, $result_type=NULL, $connection=NULL) {
		if($result_type == NULL) {
			$result_type = MYSQLI_BOTH;	
		} else if($result_type == 0) {
			$result_type = MYSQLI_NUM;	
		} else {
			$result_type = MYSQLI_ASSOC;	
		}
		$result = $this->execute($query, $connection);
		$return = array();
		while($row = mysqli_fetch_array($result, $result_type)) {
			array_push($return, $row);	
		}
		return $return;	
	}
	
	public function get_row($query, $result_type=NULL, $connection=NULL) {
		$rows = $this->get_rows($query, $result_type, $connection);
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
		return mysqli_insert_id($this->connection[0]);	
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
		//mysqli_close($this->connection[0]);
	}
	
	function replaceNonEnglish($strengur) {
		
	
	}

}


?>