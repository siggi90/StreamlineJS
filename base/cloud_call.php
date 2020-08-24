<?

class cloud_call {
	
	function __construct() {
		
	}
	
	function call($url, $data = false) {
		$curl = curl_init();

		curl_setopt($curl, CURLOPT_POST, 1);

		if($data) {
			curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
		}
	
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		
		curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
	
		$result = curl_exec($curl);
		
		curl_close($curl);
		return json_decode($result, true);
	}
}

?>