<?

class encryption {
	private $app_id;
	private $sql;
	private $statement;
	private $user_id;
	
	function __construct($app_id, $sql, $statement, $user_id) {
		$this->app_id = $app_id;
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
	}
	
	/*function get_k() {
		$digits = 64;
		$random = new random(359, $this->sql, $this->statement);
		$k = $random->_string($digits);	
		
		$query = "DELETE FROM encryption_keys WHERE app_id = '".$this->app_id."' AND user_id = ".$this->user_id;
		$this->sql->execute($query);
		
		$v = array(
			'k_hash' => password_hash($k, PASSWORD_DEFAULT),
			'app_id' => $this->app_id
		);
		$this->statement->generate($v, "encryption_keys");
		$this->sql->execute($this->statement->get());
	}
	
	/*function set_k($k) {
		$query = "DELETE FROM encryption_keys WHERE app_id = '".$this->app_id."' AND user_id = ".$this->user_id;
		$this->sql->execute($query);
		
		$v = array(
			'k_hash' => password_hash($k, PASSWORD_DEFAULT),
			'app_id' => $this->app_id
		);
		$this->statement->generate($v, "encryption_keys");
		$this->sql->execute($this->statement->get());
	}*/
	
	function set_k($k) {
		$query = "SELECT id FROM app.encryption_keys WHERE app = '".$this->app_id."' AND user_id = ".$this->user_id;
		//var_dump($query);
		$row = $this->sql->get_row($query, 1);
		
		$v = array(
			'k_hash' => password_hash($k, PASSWORD_DEFAULT),
			'app' => $this->app_id
		);
		if($row != NULL) {
			$v['id'] = $row['id'];	
		}
		
		$this->statement->generate($v, "app.encryption_keys");
		//var_dump($this->statement->get());
		$this->sql->execute($this->statement->get());
	}
	
	function _set_values($v) {
		$query = "SELECT id, k_hash FROM app.encryption_keys WHERE app = '".$this->app_id."' AND user_id = ".$this->user_id;
		$row = $this->sql->get_row($query, 1);
		$k_hash = NULL;
		if($row != NULL) {
			$k_hash = $row['k_hash'];	
			$v['id'] = $row['id'];
		}
		if($k_hash === NULL || password_verify($v['k'], $k_hash)) {
			unset($v['k']);
			//$v['key_value'] = json_encode($v['key_value']);
			//$v['key_key'] = json_encode($v['key_key']);
			$this->statement->generate($v, "app.encryption_keys");
			$this->sql->execute($this->statement->get());
			$id = $this->sql->last_id($v);
		}
	}
	
	function get_values($k) {
		$query = "SELECT key_value, key_key FROM app.encryption_keys WHERE app = '".$this->app_id."' AND user_id = ".$this->user_id;
		$row = $this->sql->get_row($query, 1);
		//var_dump($query);
		$this->set_k($k);
		if($row == NULL) {
			return array(
				'key_value' => NULL,
				'key_key' => NULL
			);	
		}
		return $row;	
	}
	
	function noob_decrypt($k_log_m_log, $km) {
		
		$log_km = log($km);
		$log_km_2 = pow($log_km, 2);
		
		$log_k_log_m = $k_log_m_log;
		
		$ab = $log_km_2 / $log_k_log_m;
		
		$ab_value = $ab - 2;
		$ab_value = $ab_value * $log_km;
		$e_value = exp($ab_value);
		
		$inverse_value = pow($e_value, 1/$ab);
		$inverse_km = pow($km, 1/$ab);
		$value = $inverse_value * $inverse_km;
		$value = pow($value, $ab);
		$value /= $km*$km;
		$value /= $km;
		
		$log_2_k_log_2_m = $log_km_2 - ($log_k_log_m*2);
		$log_k_log_m_squared = $log_k_log_m * $log_k_log_m;
		
		$a_squared_b_squared = $log_2_k_log_2_m / $log_k_log_m_squared;
		
		$a_squared_b_squared = $a_squared_b_squared * $log_km_2;
		
		$a_subtract_b = $a_squared_b_squared - ($ab * 2);
		
		$a_subtract_b = pow($a_subtract_b, 1/2);
		
		$value = pow($value, 1/$a_subtract_b);
		
		$k_squared = $value * $km;
		$k = pow($k_squared, 1/2);
		
		$k_guess = round($k);
		
		return $k_guess;
	}
	
	/*function find_k() {
		$ab_value = $this->evaluation->subtract_total($this->ab, array('value' => '2', 'remainder' => '0/1'));
		$ab_value = $this->evaluation->multiply_total($ab_value, $this->log_km);
		$e_value = $this->evaluation->whole_common(exp($this->evaluation->quick_numeric($ab_value)));
		
		
		$inverse_value = $this->evaluation->whole_common(pow($this->evaluation->quick_numeric($e_value), $this->evaluation->quick_numeric($this->evaluation->execute_divide("1", $this->ab))));
		
		$inverse_km = $this->evaluation->whole_common(pow($this->km,  $this->evaluation->quick_numeric($this->evaluation->execute_divide("1", $this->ab))));
		
		
		$value = $this->evaluation->multiply_total($inverse_value, $inverse_km);
		$value = $this->evaluation->whole_common(pow($this->evaluation->quick_numeric($value), $this->evaluation->quick_numeric($this->ab)));
		
		$value = $this->evaluation->execute_divide($value, $this->evaluation->result($this->km, $this->km));
		$value = $this->evaluation->execute_divide($value, $this->km);
		
		
		if($this->evaluation->truncate_fractions_length > 0) {
			$value['remainder'] = $this->evaluation->execute_shorten_fraction($value['remainder']);
		}
		
		$log_2_k_log_2_m = $this->evaluation->subtract_total($this->log_km_2, $this->evaluation->multiply_total($this->log_k_log_m, array('value' => '2', 'remainder' => '0/1')));
		
		$log_k_log_m_squared = $this->evaluation->multiply_total($this->log_k_log_m, $this->log_k_log_m);
		
		$a_squared_b_squared = $this->evaluation->execute_divide($log_2_k_log_2_m, $log_k_log_m_squared);
		$a_squared_b_squared = $this->evaluation->multiply_total($a_squared_b_squared, $this->log_km_2);
		
		if($this->evaluation->truncate_fractions_length > 0) {
			$a_squared_b_squared['remainder'] = $this->evaluation->execute_shorten_fraction($a_squared_b_squared['remainder']);
		}
		
		$a_subtract_b = $this->evaluation->subtract_total($a_squared_b_squared, $this->evaluation->multiply_total($this->ab, array('value' => '2', 'remainder' => '0/1')));
		
		
		
		$a_subtract_b = $this->evaluation->execute_power($a_subtract_b, 2);
		
		
		$value = $this->evaluation->whole_common(pow($this->evaluation->quick_numeric($value), $this->evaluation->quick_numeric($this->evaluation->execute_divide("1", $a_subtract_b))));
		
		if($this->evaluation->truncate_fractions_length > 0) {
			$value['remainder'] = $this->evaluation->execute_shorten_fraction($value['remainder']);
		}
		
		
		
		$k_squared = $this->evaluation->multiply_total($value, $this->evaluation->whole_common($this->km));
		$k = $this->evaluation->execute_power($k_squared, 2);
		
		
		$km = $this->km;
		
		$k_guess = $this->evaluation->round($k);
		$k_guess_add = $this->evaluation->add($k_guess, "1");
		$division = array('value' => '0', 'remainder' => '1/2');
		while($this->evaluation->fraction_values($division['remainder'])[0] != 0) {
			$division = $this->evaluation->execute_divide($km, $k_guess);
			if($this->evaluation->fraction_values($division['remainder'])[0] == 0) {
				return array($k_guess, $division['value']);	
			}
			$division = $this->evaluation->execute_divide($km, $k_guess_add);
			if($this->evaluation->fraction_values($division['remainder'])[0] == 0) {
				return array($k_guess_add, $division['value']);	
			}
			$k_guess_add = $this->evaluation->add($k_guess_add, "1");
			$k_guess = $this->evaluation->subtract($k_guess, "1");
		}
		
		return NULL;
	}*/
}

?>