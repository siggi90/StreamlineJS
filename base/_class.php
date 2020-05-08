<?

class _class {
	
	protected $sql;
	protected $user_id;
	protected $statement;
	
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
}

?>