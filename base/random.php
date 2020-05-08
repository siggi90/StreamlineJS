<?

class random extends _class {
	private $range;
	
	private $cylinders;
	
	public function __construct($range, $sql, $statement) {
		parent::__construct($sql, $statement);
		$this->range = $range;	
		$this->cylinders = array();
		$this->construct_cylinders(13);
		$this->get_state();
		//$this->save_state();
	}
	
	function construct_cylinders($count=13) {
		/*$speed = 1;
		$phase_offset = 0;
		$interlope_switch = 0;*/
		
		$speed = $this->prime_numbers($count);
		$phase_offset = $this->construct_phase_offset($count);
		$speed = $this->interlace($speed);
		$phase_offset = $this->interlace($phase_offset);
		
		$phase_offset[] = 0;
		$speed[] = 1;
		/*//echo "speed<br>";
		$this->print_arr($speed);
		//echo "phase_offset<br>";
		$this->print_arr($phase_offset);*/
		
		$counter = 0;
		while($counter < $count) {
			array_push($this->cylinders, new cylinder($phase_offset[$counter], $speed[$counter]));
			$counter++;
		}
		
		/*for($phase_index = 0; $phase_index < 18; $phase_index += 3) {
			for($auxiliary_index = 36; $auxiliary_index > 0; $auxiliary_index -= 6) {
				$phase_offset = $phase_index + $auxiliary_index;*/
				/*if($interlope_switch == 0) {
					$speed++;
				} else {
					$speed--;	
				}
				if($speed > 6 && $interlope_switch == 0) {
					$interlope_switch = 1;
				} else if($speed <= 0  && $interlope_switch == 1)  {
					$interlope_switch = 0;
				}
			}
		}*/
	}
	
	function _random($start, $stop, $amount) {
		$results = array();
		$number = $stop - $start;
		$offset = $start;
		if($number <= 359) {
			$counter = 0;
			while($counter < $amount) {
				$result = $this->run($number);	
				$result += $offset;
				$results[] = $result;
				$counter++;
			}
		} else {
			$digits = strlen($number)-1;
			$max_first_digit = substr($number, 0, 1);
			while($amount > 0) {
				$intermediate_results = $this->_random_length($amount, $digits);
				//echo "intermediate_results:\n";
				//var_dump($intermediate_results);
				$add_count = 0;
				foreach($intermediate_results as $value) {
					$first_digit = $this->run($max_first_digit);
					$value = $first_digit.$value;
					if($value <= $number) {
						$results[] = $value;	
						$add_count++;
					}
				}
				$amount = $amount - $add_count;
			}
			foreach($results as $index => $value) {
				//var_dump($value);
				$results[$index] = $value + $offset;	
			}
		}
		return $results;
	}
	
	function _string($digits) {
		$counter = 0;
		$result = "";
		$double_digits = floor($digits / 2);
		while($counter < $double_digits) {
			$value = $this->run(99);
			if(strlen($value) < 2) {
				$value = "0".$value;	
			}
			$result .= $value;
			//var_dump($result);
			$counter++;	
		}
		$counter = 0;
		$remaining_digits = $digits - ($double_digits*2);
		while($counter < $remaining_digits) {
			$value = $this->run(9);
			$result .= $value;
			//var_dump($result);
			$counter++;	
		}
		return $result;
	}
	
	function _random_length($amount, $string_length) {
		$counter = 0;
		$result = array();
		while($counter < $amount) {
			$result[] = $this->_string($string_length);
			$counter++;	
		}
		return $result;
	}
	
	public function run($range) {
		$this->range = $range;	
		$this->run_simulation(0, NULL, NULL);
		return $this->get_number();
	}
	
	public function save_state() {
		$position = $this->get_position();
		$v = array(
			'particle_x' => $position[0],
			'particle_y' => $position[1],
			'particle_direction' => $this->get_direction()
		);
		$this->statement->generate($v, 'numrand.state', 1);
		$result = $this->sql->execute($this->statement->get());
		$id = $this->sql->last_id();	
		foreach($this->cylinders as $index => $cylinder) {
			$v = array(
				'cylinder_index' => $index,
				'state_id' => $id,
				'phase_offset' => $cylinder->get_phase_offset(),
				'speed' => $cylinder->get_speed()
			);
			$this->statement->generate($v, 'numrand.cylinder', 1);
			$this->sql->execute($this->statement->get());	
		}
	}
	
	public function get_state($offset=0) {
		$query = "SELECT * FROM numrand.state ORDER BY id DESC LIMIT ".$offset.", 1";
		$state = $this->sql->get_row($query);
		if($state['particle_x'] != NULL) {
			$start_cylinder = $this->cylinders[0];
			$start_cylinder->set_position(array(
				$state['particle_x'],
				$state['particle_y']
			));
			$start_cylinder->set_direction($state['particle_direction']);
			$query = "SELECT * FROM numrand.cylinder WHERE state_id = ".$state['id']." ORDER BY cylinder_index ASC";
			//echo $query."<br>";
			$cylinders = $this->sql->get_rows($query);
			if(count($cylinders) == count($this->cylinders)) {
				foreach($this->cylinders as $index => $cylinder) {
					$this->cylinders[$index]->set_phase_offset($cylinders[$index]['phase_offset']);
					$this->cylinders[$index]->set_speed($cylinders[$index]['speed']);	
				}
			} else {
				$this->get_state($offset+1);	
			}
		}
	}
	
	public function print_arr($arr) {
		foreach($arr as $key => $value) {
			//echo $key." : ".$value."<br>";	
		}
	}
	
	public function prime_numbers($count) {
		$prime_numbers = array();
		$counter = 3;
		while(count($prime_numbers) < $count) { // && $counter < 10
			if($this->is_prime($counter)) {
				array_push($prime_numbers, $counter);
			}
			$counter++;
		}
		return $prime_numbers;
	}
	
	public function is_prime($number) {
		for($counter=2; $counter<$number; $counter++) {
			/*//echo "number: ".$number."<br>";
			//echo "counter: ".$counter."<br>";
			//echo "remainder: ".($number % $counter)."<br>";*/
			if($number % $counter == 0) {
				return false;	
			}
		}
		return true;
	}
	
	public function interlace($arr) {
		$split = $this->array_split($arr);
		$split[1] = array_reverse($split[1]);
		$result = array();
		$counter = 0;
		foreach($split[0] as $item) {
			$result[] = $item;
			if(isset($split[1][$counter])) {
				$result[] = $split[1][$counter];
			}
			$counter++;
		}
		return $result;
	}
	
	public function array_split($arr) {
		$split = ceil(count($arr)/2);
		$result = array(array(), array());
		for($counter=0; $counter<count($arr); $counter++) {
			if($counter < $split) {
				$result[0][] = $arr[$counter];
			} else {
				$result[1][] = $arr[$counter];
			}
		}
		return $result;
	}
	
	public function construct_phase_offset($count) {
		$phase = 0;
		$phases = array();
		while(count($phases) < $count) {
			$phases[] = $phase;
			$phase += 30;
			if($phase == 360) {
				$phase = 0;	
			}
		}
		return $phases;
		/*for($phase_index = 0; $phase_index < 18; $phase_index += 3) {
			for($auxiliary_index = 36; $auxiliary_index > 0; $auxiliary_index -= 6) {
			}
		}*/
	}
	
	private $been_run = false;
	
	public function run_simulation($index=0, $particle_position=array(0,0), $particle_direction=60) {
		/*//echo "count cylinders: ".count($this->cylinders)."<br>";
		//echo "index: ".$index."<br>";*/
		//$this->been_run = true;
		if($index < count($this->cylinders)) {
			if($particle_position != NULL) {
				$this->cylinders[$index]->set_position($particle_position);
			}
			if($particle_direction != NULL) {
				$this->cylinders[$index]->set_direction($particle_direction);
			}
			$result = $this->cylinders[$index]->calculate_translation();
			/*//echo "<br>result particle_pos: ".$result['particle_position'][0]." - ".$result['particle_position'][1]."<br>";
			//echo "result direction : ".$result['particle_direction']."<br><br>";*/
			return $this->run_simulation(++$index, $result['particle_position'], $result['particle_direction']);
		}
		$this->cylinders[0]->set_position($this->get_position());
		$this->cylinders[0]->set_direction($this->get_direction());
		$this->save_state();
		return $particle_position;
	}
	
	/*public function get_number() {
		$phase = $this->cylinders[count($this->cylinders)-1]->get_phase_offset();
		$step_size = 360 / $this->range;
		$counter = 0;
		while($counter < $phase) {
			$counter += $step_size;	
		}
		$number = $counter / $step_size;
		return $number;	
	}*/
	
	private $step_size;
	private $dismiss_count;
	
	public function step_size() {
		$step_size = 360 / $this->range;
		if(360 % $step_size == 0) {
			//return $step_size;	
		} else {
			$step_size = ceil($step_size);
			if(360 % $step_size == 0) {
				//return $step_size;	
			} else {
				while(360 % $step_size != 0) {
					////echo "step_change: ".$step_size."<br>";
					$step_size--;	
				}
			}
		}
		$step_count = 360/$step_size;
		$dismiss = $step_count - $this->range;
		$this->step_size = $step_size;
		$this->dismiss_count = $dismiss;
		/*//echo "step_size: ".$this->step_size."<br>";
		//echo "dismiss_count: ".$this->dismiss_count."<br><br>";*/
		return $this->step_size;
	}
	
	public function get_number() {
		/*if(!$this->been_run) {
			$this->run_simulation(0, $this->get_first_position(), $this->get_first_direction());	
		}*/
		$phase = $this->cylinders[count($this->cylinders)-1]->get_phase_offset();
		$step_size = $this->step_size();
		$counter = 0;
		while($counter <= $phase) {
			$counter += $step_size;	
		}
		$number = $counter / $step_size;
		//var_dump($number);
		if(strpos($number, ".") !== false) {
			$split = explode(".", $number);
			$number = $split[0];	
		}
		/*$dismiss_stop = 360/$step_size;
		$dismiss_start = $dismiss_stop - $this->dismiss_count;*/
		if($number > $this->range) {
			$this->run_simulation(0, $this->get_position(), $this->get_direction());
			return $this->get_number();
		} else {
			////echo "number: ".($number-1)."<br>";
			$query = "INSERT INTO numrand.result_log (number, max, ratio) VALUES(".($number-1).", ".$this->range.", '".(($number-1)/$this->range)."')";
			////echo $query."<br>";
			$this->sql->execute($query);
			return ($number-1);
		}
	}
	
	public function get_position() {
		return $this->cylinders[count($this->cylinders)-1]->get_current_position();
	}
	
	public function get_first_position() {
		return $this->cylinders[0]->get_current_position();
	}
	
	public function get_direction() {
		return $this->cylinders[count($this->cylinders)-1]->get_current_direction();
	}
	
	public function get_first_direction() {
		return $this->cylinders[0]->get_current_direction();
	}
	
	function reorder_list($v) {
		$list = explode("\\n", $v['list_input']);
		$clean_list = array();
		foreach($list as $value) {
			if(strlen(trim($value)) > 0) {
				$clean_list[] = $value;	
			}
		}
		$list = $clean_list;
		//var_dump($list);
		$count = count($list);
		$numbers = $this->_random(0, $count, $count);
		//var_dump($numbers);
		$output_list = array();
		
		foreach($list as $index => $value) {
			$placement = $numbers[$index];
			//echo "placement: ".$placement."<br>";
			if(!isset($output_list[$placement])) {
				$output_list[$placement] = $value;	
			} else {
				$not_placed = true;
				while(isset($output_list[$placement]) && $not_placed) {
					$placement++;
					if($placement == $count) {
						$placement = 0;
					}
					if(!isset($output_list[$placement])) {
						$output_list[$placement] = $value;
						$not_placed = false;
					}
				}
			}
		}
		ksort($output_list);
		//var_dump($output_list);
		return implode("
", $output_list);	
	}
	
	/*public function get_number() {
		$particle_position = $this->run_simulation();
		$area = pi()*2500;
		$grid_unit = $area / $this->range;
		
		$grid_unit_length = sqrt($grid_unit);
		
		$abs_x = abs($particle_position[0]);
		$abs_y = abs($particle_position[1]);
		
		$grid_x = round($abs_x / $grid_unit_length);
		$grid_y = round($abs_y / $grid_unit_length);
		$offset_increment = $this->range / 4;
		$offset = 0;
		if($particle_position[0] < 0) {
			if($particle_position[1] >= 0) {
				
			} else {
				$offset = 2*$offset_increment;
			}
		} else {
			if($particle_position[1] >= 0) {
				$offset = $offset_increment;
			} else {
				$offset = 3*$offset_increment;
			}
		}
		$number = ($grid_x*$grid_y)+$offset;
		return $number;
	}*/
	
	/*public function get_state() {
		return $this->cylinders[0]->get_state();	
	}*/
}

/*$state = $random->get_state();
//echo "direction: ".$state['direction']."<br>";
//echo "offset: ".$state['phase_offset']."<br>";*/

/*$prime = $random->prime_numbers(5);
var_dump($prime);*/

//var_dump($result);

////echo $random->get_number();
?>