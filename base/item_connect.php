<?

class item_connect extends item {
	protected $connect_values;
	
	public function set_connect_values($connect_values) {
		$this->connect_values = $connect_values;	
	}
	
	function table($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) {
		$rows = parent::table($search_term, $offset, $item_id, $post_data, $select_columns);
		foreach($rows as $key => $row) {
			foreach($this->connect_values as $column => $table) {
				$query = "SELECT * FROM ".$table." WHERE id = ".$row[$column];
				$addition = $this->sql->get_row($query, 1);
				foreach($addition as $addition_key => $addition_value) {
					if(!isset($rows[$key][$addition_key])) {
						$rows[$key][$addition_key] = $addition_value;	
					}
				}
			}
		}
		
		return $rows;
	}
}

?>