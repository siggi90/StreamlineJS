<?

class update {
	public $function_access = array(
		'admin' => array(
			'recieve_updates'
		)
	);
	
	private $streamline = false;
	
	private $streamline_exclude = array(
		'appstat'
	);
	
	private $server_root;
	
	function __construct() {
		$this->server_root = $_SERVER["DOCUMENT_ROOT"];
		
		global $config_global;
		
		if(isset($config_global['streamline'])) {
			$this->streamline = $config_global['streamline'];
		}
	}
	
	function recieve_updates_($updates) {
		foreach($updates as $path => $content) {
			$split = explode("/", $path);
			
			if(($this->streamline && !in_array($split[1], $this->streamline_exclude)) || !$this->streamline) {
				$full_path = $_SERVER["DOCUMENT_ROOT"];
				foreach($split as $key => $directory) {
					if($key != count($split)-1) {
						$full_path .= "/".$directory;
						if(!file_exists($full_path)) {
							mkdir($full_path);	
						}
					}
				}
				
				$content = stripcslashes($content);
				file_put_contents($_SERVER["DOCUMENT_ROOT"].$path, $content);	
			}
		}
			
	}
}

?>