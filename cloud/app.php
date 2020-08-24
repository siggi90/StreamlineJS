<?

include '../base/base.php';

class app extends base {
	
	public $streamline;
	public $cloud;
	public $update;
	
	public function __construct() {
		parent::__construct('cloud', "/cloud");
		
		$this->cloud = new cloud($this->sql, $this->statement, $this->user_id, $this);
		$this->update = new update();
	}
	
}

?>