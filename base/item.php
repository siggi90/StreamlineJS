<?

class item {
	protected $sql;
	protected $statement;
	protected $user_id;
	private $language;
	public $item_id;
	public $item_table;
	private $ordered;
	
	function __construct($item_id, $item_table, $_class, $ordered=false, $language=0) {
		$this->item_id = $item_id;
		$this->item_table = $item_table;
		$this->ordered = $ordered;
		$this->sql = $_class->get_sql();
		$this->statement = $_class->get_statement();
		$this->user_id = $_class->get_user_id();
		$this->language = $language;
	}
	
	function _($v) {
		$this->statement->generate($v, $this->item_table);
		$this->sql->execute($this->statement->get());
		$id = $this->sql->last_id($v);
		
		if($this->ordered) {
			$query = "INSERT INTO item_order (connect_id, connect_value, order_value) VALUES('".$id."', '".$this->item_id."', '-1')";
			$this->sql->execute($query);	
		}
		
		return $id;
	}
	
	function get($id) {
		$query = "SELECT * FROM ".$this->item_table." WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function delete($id) {
		$query = "DELETE FROM ".$this->item_table." WHERE id = ".$id;
		$this->sql->execute($query);	
	}
	
	function table($search_term=NULL, $offset=0) {
		$query_search = "";
		if($search_term	!= NULL && $search_term != '') {		
			$columns = $this->sql->table_columns($this->item_table);
			$query_search = " WHERE";
			foreach($columns as $column) {
				if(strpos($column, "_id") === false && $column != "id") {
					$query_search .= " ".$column." = '".$search_term."'";	
				}
			}
		}
		$query_order_table = "";
		$query_order = "";
		if($this->ordered) {
			$query_order_table = ", item_order";
			if($query_search == "") {
				$query_order .= " WHERE";
			} else {
				$query_order .= " AND";	
			}
			$query_order .= " item_order.conntect_id = ".$this->Item_table.".id AND item_order.connect_value = '".$this->item_id."' ORDER BY item_order.order_value ASC";
		}
		$offset_string = " LIMIT 10";
		if($offset > 0) {
			$offset_string = " LIMIT ".$offset.", 10";
		}
		$query = "SELECT * FROM ".$this->item_table.$query_order_table.$query_search.$query_order.$offset_string;
		return $this->sql->get_rows($query, 1);
	}
	
	function list_count() {
		$query = "SELECT COUNT(*) as count FROM ".$this->item_table;
		return $this->sql->get_row($query, 1)['count'];	
	}
	
}

?>