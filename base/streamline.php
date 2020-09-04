<?

class streamline {
	private $sql;
	private $statement;
	private $user_id;
	private $calendar;
	
	function __construct($sql, $statement, $user_id) {
		$this->sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		$this->calendar = new calendar();
	}
	
	/*function _objective($v) {
		$this->statement->generate($v);
		$this->sql->execute($this->statement->get());	
		return $this->sql->last_id();	
	}
	
	function objectives($search_term) {
		$query = "SELECT * FROM objectives WHERE user_id = ".$this->user_id;
		return $this->sql->get_rows($query);	
	}*/
	
	function menu($data) {	//top/side
	//var_dump($data);
		//$data = json_decode($data, true);
		//var_dump($data);
		$position = $data['position'];
		$menu_items = $data['content_parsed'];
		
		$width = (100/count($menu_items));
		
		echo 
		"<div class='menu_".$position." ".$data['id']."_menu'>";
		foreach($menu_items as $menu_item) {
			echo
        	"<div class='menu_button ".$menu_item['id']."_button' style='width:".$width."%;'><a>".$menu_item['title']."</a></div>";
		}
        echo
		"</div>";	
	}
	
	function calendar_popover($year, $month, $day) {
		return $this->calendar->month($year, $month, $day);	
	}
		
	function generate_backend() {
		$handle = fopen("/Applications/XAMPP/xamppfiles/htdocs/streamline/app/definitions.js", "r");
		$line_count = 0;
		$object_value = "";
		if($handle) {
			while(($line = fgets($handle)) !== false) {
				if($line_count > 0 && trim($line) != ";") {
					//var_dump($line);
					$object_value .= "".$line;	
				}
				$line_count++;
			}
		}
		fclose($handle);
		//var_dump($object_value);
		$object = json_decode($object_value, true);
		
		$pages = $object['pages'];
		
		$get_functions = array();
		$set_functions = array();
		
		$set_types = array(
			'form'
		);
		$get_types = array(
			'list',
			'table'
		);
		
		foreach($pages as $page) {
			$content = $page['content'];
			foreach($content as $content_item) {
				$set_function = NULL;
				$get_function = NULL;
				if(in_array($content_item['type'], $get_types)) {
					$get_function = array(
						'name' => $content_item['id']."_".$content_item['type']
					);	
				} else if(in_array($content_item['type'], $set_types)) {
					$set_function = array(
						'name' => $content_item['id']
					);	
				}
				
				if($set_function != NULL) {
					$set_functions[] = $set_function;	
				}
				if($get_function != NULL) {
					$get_functions[] = $get_function;	
				}
			}
		}
		
		//var_dump($object);
		//var_dump("test");
		var_dump($get_functions);
		var_dump($set_functions);
		
		
		return 1;
	}
	
}


?>