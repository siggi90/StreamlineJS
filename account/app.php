<?

include '../base/base.php';

class app extends base {
	
	public $streamline;
	public $account;
	
	public function __construct() {
		parent::__construct('account', "/account");
		
		//if($this->user_id != -1) {
			$this->streamline = new streamline($this->sql, $this->statement, $this->user_id);
			$this->account = new account($this->sql, $this->statement, $this->user_id);
		//}
	}
	
}

?>