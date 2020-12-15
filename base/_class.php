<?

class _class {
	
	protected $sql;
	protected $user_id;
	protected $statement;
	public $items;
	protected $language = 0;
	
	//public $offset_increment = 10;
	
	public function __construct($sql, $statement, $user_id=NULL) {
		$this->sql = $sql;
		$this->statement = $statement;
		if($user_id != NULL) {
			$this->set_user_id($user_id);	
		}
	}
	
	public function set_user_id($user_id) {
		$this->user_id = $user_id;	
	}
	
	function get_sql() {
		return $this->sql;	
	}
	
	function get_user_id() {
		return $this->user_id;	
	}
	
	function get_statement() {
		return $this->statement;	
	}
	
	function get_order($rows, $connect_value) {
		foreach($rows as $key => $row) {
			$query = "SELECT * FROM item_order WHERE connect_id = '".$row['id']."' AND connect_value = '".$connect_value."'";
			$result = $this->sql->get_row($query, 1);
			if($result != NULL) {
				$rows[$key]['order'] = $result['order_value'];	
			} else {
				$rows[$key]['order'] = -1;	
			}
		}
		usort($rows, function($a, $b) {
			return $a['order'] > $b['order'];
		});
		return $rows;	
	}
	
	function set_order($v, $connect_value) {
		foreach($v as $key => $value) {
			if($value != '-1') {
				$query = "DELETE FROM item_order WHERE connect_id = '".$value."' AND connect_value = '".$connect_value."'";
				$this->sql->execute($query);
				$query = "INSERT INTO item_order (connect_id, connect_value, order_value) VALUES('".$value."', '".$connect_value."', ".$key.")";
				var_dump($query);
				$this->sql->execute($query);
			}
		}
	}	
}

?>