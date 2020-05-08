<?

class vector {
	private $evaluation;
	
	function __construct($evaluation) {
		$this->evaluation = $evaluation;//new evaluation();
	}
	
	function compare_vectors($u, $v) {
		if($u[0] == $v[0] && $u[1] == $v[1]) {
			return true;
		}
		return false;
	}
	function angle_between_vectors($u, $v) {
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
	function flip_vector($u) {
		$vector = array($u[0], -$u[1]);
		return $vector;
	}
	function flip_x($u) {
		$vector = array(-$u[0], $u[1]);
		return $vector;
	}
	function degree_difference($deg1, $deg2) {
		if($deg1 < 0) {
			$deg1 = 360 + $deg1;
		}
		if($deg2 < 0) {
			$deg2 = 360 + $deg2; 
		}
		$result = $deg1 - $deg2;
		return abs($result);
	}
	
	function reset_distance($point, $fraction) {
	
		$vector = array($point[0], $point[1]);
		$vector[0] *= $fraction;
		$vector[1] *= $fraction;
		return $vector;
	}
	function reverse_vector($v) {
		$u = array($this->evaluation->negative_value($v[0]), $this->evaluation->negative_value($v[1]));
		return $u;
	}
	function reset_vector_length($point, $length) {
		$initial_length = $this->vector_distance($point, array(0,0));
		$fraction = $length/$initial_length;
		$new_point = $this->reset_distance($point, $fraction);
		$new_distance = $this->vector_distance($new_point, array(0,0));
		return $new_point;
	}
	/*function set_div_pos($id, $u) {
		$('#'+$id).css({
			private $'left' = u[0];
			private $'bottom' = u[1;
		});
	}*/
	function dot_product($u, $v) {
		return ($u[0]*$v[0])+($u[1]*$v[1]);
	}
	
	function projection($u, $v) {
		$division = pow($this->distance($v[0], $v[1]), 2);
		if($division == 0) {
			return 0;
		}
		$vector = array($v[0], $v[1]);
		$mult = $this->dot_product($u, $v) / $division;
		$vector[0] *= $mult;
		$vector[1] *= $mult;
		return $vector;
	}
	
	function vector_distance($u, $v=array(0, 0)) {
		/*if(!isset($v)) {
			$v = array(0, 0);
		}*/
		return $this->distance($u[0], $u[1], $v[0], $v[1]);
	}
	
	function vector_sum($u, $value) {
		$vector = array($u[0], $u[1]);
		$vector[0] += $value;
		$vector[1] += $value;
		return $vector;
	}
	
	function add_vector($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] = $this->evaluation->add($vector[0], $v[0]);//+= $v[0];
		$vector[1] = $this->evaluation->add($vector[1], $v[1]);//+= $v[1];
		return $vector;
	}
	
	function distance($x_from, $y_from, $x_to=0, $y_to=0) {
		$value = sqrt(pow(($x_from - $x_to), 2)+pow(($y_from - $y_to), 2));
		return $value;
	}
	
	function length($u) {
		return $this->distance($u[0], $u[1]);	
	}
	
	function normalize_vector($v) {
		$length = $this->vector_distance($v, array(0,0));
		if($length == 0) {
			return $v;	
		}
		$vector = array($v[0], $v[1]);
		$vector[0] /= $length;
		$vector[1] /= $length;
		return $vector;
	}
	
	function subtract_vector($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] -= $v[0];
		$vector[1] -= $v[1];
		/*$vector[0] = $this->evaluation->subtract_total($vector[0], $v[0]);
		$vector[1] = $this->evaluation->subtract_total($vector[1], $v[1]);*/
		return $vector;
	}
	function sum_vector($u, $v) {
		$vector = array($u[0], $u[1]);
		$vector[0] += $v[0];
		$vector[1] += $v[1];
		return $vector;
	}
	
	function stretch_vector($v, $unit_value) {
		$vector = array($v[0], $v[1]);
		$vector[0] *= $unit_value;
		$vector[1] *= $unit_value;
		/*$vector[0] = $this->evaluation->multiply_total($vector[0], $unit_value);
		$vector[1] = $this->evaluation->multiply_total($vector[1], $unit_value);*/
		return $vector;
	}
	
	function reflection($d, $n) {
		$n = array($n[0], $n[1]);
		$n = $this->normalize_vector($n);
		$dot = $this->dot_product($d, $n);
		$dot = 2*$dot;
		$stretch = $this->stretch_vector($n, $dot);
		$subtract = $this->subtract_vector($d, $stretch);
		return $subtract;
	}
	
	function rotate($u, $clockwise=true) {
		$v = array($u[1], $this->evaluation->negative_value($u[0]));
		return $v;
	}
}

?>