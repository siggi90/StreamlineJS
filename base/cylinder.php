<?

class cylinder {
	private $speed; // = 1;
	private $phase_offset; // = 0;
	private $particle_position; // = array(0,0);
	private $particle_direction; // = 60;
	//private $borders = 1;
	private $radius;// = 50;
	private $center = array(0, 0);
	private $radians = 0.0174532925;
	private $stop_flag = false;
	private $gap = array(50, 0);
	private $pivot_radial = 25;
	
	function __construct($phase_offset, $speed, $particle_position=array(0, 0), $radius=50, $particle_direction=60) {
		$this->speed = $speed;
		$this->phase_offset = $phase_offset;
		$this->borders = array();
		/**/
		/*if(!isset($radius)) {
			$this->radius = 50;
		} else {*/
			$this->radius = $radius;
		//}
		/*if(typeof($particle_position) === 'undefined') {
			$this->particle_position = array(0, 0);
		} else {*/
			$this->particle_position = $particle_position;
		//}
		//$this->particle_direction = 60;//30; //-60
		$this->particle_direction = $particle_direction;
		$this->gap = array(5, 5);
	
		$this->calculate_rotation();
	}
	
	public function get_phase_offset() {
		return $this->phase_offset;	
	}
	
	public function set_phase_offset($phase_offset) {
		$this->phase_offset = $phase_offset;	
	}
	
	public function get_speed() {
		return $this->speed;	
	}
	
	public function set_speed($speed) {
		$this->speed = $speed;	
	}
	
	public function get_current_direction() {
		return $this->particle_direction;	
	}
	
	public function get_current_position() {
		return $this->particle_position;	
	}
	
	public function set_direction($particle_direction) {
		$this->particle_direction = $particle_direction;	
	}
	
	public function set_position($particle_position) {
		$this->particle_position = $particle_position;
	}
	public function get_direction($degree, $direction_coordinates) {
		
		$long_side_direction = $this->particle_direction+$degree;
		
		$long_side_coordinates = $this->degree_to_coordinates($long_side_direction);
		$long_side_coordinates = $this->reset_vector_length($long_side_coordinates, $this->radius);
	
		$projection = $this->projection($long_side_coordinates, $direction_coordinates);
	
		$middle_vector = $this->subtract_vector($this->particle_position, $projection);
		$middle_sub = $this->reset_distance($long_side_coordinates, 1/2);
	
		$middle_vector = $this->subtract_vector($this->particle_position, $middle_sub);
		$middle_vector = $this->reverse_vector($middle_vector);
		$direction_coordinates = array($direction_coordinates[0], -$direction_coordinates[1]); 
	
		$reflection = $this->reflection($this->reverse_vector($direction_coordinates), $middle_vector);
		
		return $this->coordinates_to_degree($reflection);
	}
	private $border_counter = 0;
	private $border_interlope = 0;
	private function within_borders() {
		$distance = sqrt(pow($this->particle_position[0], 2)+pow($this->particle_position[1], 2));
		$reflect = 0;
		if($distance > $this->radius) {
			$reflect = 1;
		} else if ($this->within_pivot()) {
			$reflect = 2;
		}
		$fraction;
		if($reflect > 0) {
			$direction_coordinates = $this->degree_to_coordinates($this->particle_direction);
			if($reflect == 1) {
				$fraction = $this->radius / $distance;
				$this->particle_position = $this->reset_distance($this->particle_position, $fraction);
			}
	
			$reflection;
			$left = $this->get_direction(-90, $direction_coordinates);
			$right = $this->get_direction(+90, $direction_coordinates);
	
			$left_size = $this->degree_difference($this->particle_direction, $left);
			$right_size = $this->degree_difference($this->particle_direction, $right);
			$angle = $this->angle_between_vectors($this->reverse_vector($this->particle_position), $this->reverse_vector($direction_coordinates));
	
			/*$smaller = true;
			if($angle > 45) {
				$smaller = false; 
			}
			$left = true;
			if($this->border_interlope == 1) {
				if($smaller) {
					if($left_size < $right_size) { // && $left_size < 180
						$reflection = $left;
					} else {
						$reflection = $right;
						$left = false;
					}
				} else {
					if($left_size > $right_size) { // && $left_size < 180
						$reflection = $left;
					} else {
						$reflection = $right;
						$left = false;
					}
				}
				//$difference_circle
			} else {
				$reflection = $right;
			}*/
			$reflection = $right;
			$this->border_counter++;
			$this->particle_direction = $reflection;
		}
	}
	private function compare_vectors($u, $v) {
		if($u[0] == $v[0] && $u[1] == $v[1]) {
			return true;
		}
		return false;
	}
	private function angle_between_vectors($u, $v) {
		if($this->compare_vectors($u, $v)) {
			return 0;
		}
		$dot = $this->dot_product($u, $v);
		$u_distance = $this->vector_distance($u);
		$v_distance = $this->vector_distance($v);
		$division = $u_distance + $v_distance;
		$result = $dot / $division;
		$result = acos($result);
		$result = $result * 57.2957795; 
		return $result;
	}
	private function flip_vector($u) {
		$vector = array($u[0], -$u[1]);
		return $vector;
	}
	private function flip_x($u) {
		$vector = array(-$u[0], $u[1]);
		return $vector;
	}
	private function degree_difference($deg1, $deg2) {
		if($deg1 < 0) {
			$deg1 = 360 + $deg1;
		}
		if($deg2 < 0) {
			$deg2 = 360 + $deg2; 
		}
		$result = $deg1 - $deg2;
		return abs($result);
	}
	
	private function reset_distance($point, $fraction) {
	
		$vector = array($point[0], $point[1]);
		$vector[0] *= $fraction;
		$vector[1] *= $fraction;
		return $vector;
	}
	private function reverse_vector($v) {
		$u = array(-$v[0], -$v[1]);
		return $u;
	}
	private function reset_vector_length($point, $length) {
		$initial_length = $this->vector_distance($point, array(0,0));
		$fraction = $length/$initial_length;
		$new_point = $this->reset_distance($point, $fraction);
		$new_distance = $this->vector_distance($new_point, array(0,0));
		return $new_point;
	}
	/*private function set_div_pos($id, $u) {
		$('#'+$id).css({
			private $'left' = u[0];
			private $'bottom' = u[1;
		});
	}*/
	private function dot_product($u, $v) {
		return ($u[0]*$v[0])+($u[1]*$v[1]);
	}
	
	private function projection($u, $v) {
		$division = pow($this->distance($v[0], $v[1]), 2);
		if($division == 0) {
			return array(0, 0);
		}
		$vector = array($v[0], $v[1]);
		$mult = $this->dot_product($u, $v) / $division;
		$vector[0] *= $mult;
		$vector[1] *= $mult;
		return $vector;
	}
	
	private function within_gap() {
		$particle_position = $this->particle_position;
		$gap = $this->gap;
		$projection = $this->projection($particle_position, array($gap[0], $gap[1]));
		$distance = $this->vector_distance($this->particle_position, $projection);
	
		$radial_position = $this->vector_distance($this->particle_position, array(0,0));
		if($distance < 0.3 && $radial_position > 10 && $radial_position < 40) {
			return true;
		}
		return false;
	}
	private $pivot_offset = 0;
	private $pivot_range = 1;
	private $pivot_width = 0.5;
	private function within_pivot() {	//and
		$particle_position = $this->particle_position;
		$pivot;
		if($this->pivot_offset == 0) {
			$pivot = $this->reverse_vector($this->gap);
		} else {
			$pivot_degree = $this->pivot_offset+180;
			$pivot = $this->degree_to_coordinates($pivot_degree);
		}
		$projection = $this->projection($particle_position, array($pivot[0], $pivot[1]));
		$distance = $this->vector_distance($this->particle_position, $projection);
		$radial_position = $this->vector_distance($this->particle_position, array(0,0));
		if($distance < $this->pivot_range && $radial_position > ($this->pivot_radial-$this->pivot_width) && $radial_position < ($this->pivot_radial+$this->pivot_width)) {
			return true;
		}
		return false;
	}
	private function vector_distance($u, $v=array(0, 0)) {
		/*if(!isset($v)) {
			$v = array(0, 0);
		}*/
		return $this->distance($u[0], $u[1], $v[0], $v[1]);
	}
	private function vector_sum($u, $value) {
		$vector = array($u[0], $u[1]);
		$vector[0] += $value;
		$vector[1] += $value;
		return $vector;
	}
	private function add_vectors($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] += $v[0];
		$vector[1] += $v[1];
		return $vector;
	}
	private function distance($x_from, $y_from, $x_to=0, $y_to=0) {
		$value = sqrt(pow(($x_from - $x_to), 2)+pow(($y_from - $y_to), 2));
		return $value;
	}
	
	private function particle_distance($x, $y) {
		return $this->distance(x, $y, $this->particle_position[0], $this->particle_position[1]);
	}
	
	private function calculate_rotation() {
		$radian = ($this->phase_offset) * 0.0174532925;
		$x = cos($radian)*50;
		$y = sin($radian)*50;
		$this->gap = array($x, $y);
		$this->phase_offset += $this->speed;
		if($this->phase_offset >= 360) {
			$this->phase_offset = $this->phase_offset - 360;
		}
	}
	
	private function normalize_vector($v) {
		$length = $this->vector_distance($v, array(0,0));
		$vector = array($v[0], $v[1]);
		$vector[0] /= $length;
		$vector[1] /= $length;
		return $vector;
	}
	
	private function subtract_vector($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] -= $v[0];
		$vector[1] -= $v[1];
		return $vector;
	}
	private function sum_vector($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] += $v[0];
		$vector[1] += $v[1];
		return $vector;
	}
	
	
	private function stretch_vector($v, $unit_value) {
		$vector = array($v[0], $v[1]);
		$vector[0] *= $unit_value;
		$vector[1] *= $unit_value;
		return $vector;
	}
	
	private function reflection($d, $n) {
		$n = array($n[0], $n[1]);
		$n = $this->normalize_vector($n);
		$dot = $this->dot_product($d, $n);
		$dot = 2*$dot;
		$stretch = $this->stretch_vector($n, $dot);
		$subtract = $this->subtract_vector($d, $stretch);
		return $subtract;
	}
	
	private function coordinates_to_degree($v) {
		$rad = atan2($v[1], $v[0]);
		$deg = $rad * (180 / pi());
		return $deg;
	}
	
	private function degree_to_coordinates($deg) {
		$radian = ($deg) * 0.0174532925;
		$x = cos($radian);
		$y = sin($radian);
		return array($x, $y);
	}
	
	
	private $step_increment = 1;
	private $test_array = array(1, 1);
	private function test_function($input) {
		$input[0] += 3;
		return $input;
	}
	
	private $init_log = 0;
	
	public function calculate_translation() {
		//ob_start();
		$in_gap = $this->within_gap();
		//var_dump($this->particle_position);
		while(!$in_gap) {
			//ob_clean();
			//$this->visualize();
			/*if($this->init_log < 2) {
				echo "particle_direction: ".$this->particle_direction."<br>";	
				echo "particle_position: x: ".$this->particle_position[0]." y: ".$this->particle_position[1]."<br>";
				echo "phase_offset: ".$this->phase_offset."<br>";
				$this->init_log++;
			}*/
			$translation = array(cos($this->particle_direction*$this->radians)*$this->step_increment, sin($this->particle_direction*$this->radians)*$this->step_increment);
			$this->particle_position[0] += $translation[0];
			$this->particle_position[1] += $translation[1];
			$this->within_borders();
			$in_gap = $this->within_gap();
			$this->calculate_rotation();
			/*if($this->particle_direction != 60) {
				echo "direction: ".$this->particle_direction."<br>";	
			}*/
		}
		return array(
			'particle_position' => $this->particle_position,
			'particle_direction' => $this->particle_direction
		);
		/*if(!$in_gap && !$this->stop_flag) {
			setTimeout(function() {
				$this->calculate_translation();
			} 35);
		}*/
	}
	/*private function visualize() {
		$rotation = $this->phase_offset;
		if($rotation < 0) {
			$rotation = 360 + $rotation;
		}
		$rotation = -$rotation;
		$("#$gap").css('transform', 'rotate('+$rotation+'$deg)');
		$x = round($this->particle_position[0]);
		$y = round($this->particle_position[1]);
		$('#particle').css({
			private $'left' = x;
			private $'bottom' = ;
		});
	}*/
	public function get_state() {
		return array(
			'direction' => $this->particle_direction,
			'phase_offset' => $this->phase_offset
		);	
	}
}

?>