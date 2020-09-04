<?

class rss {
	
	function __construct() {
		
	}
	
	function mb_ord($char, $encoding = 'UTF-8') {
		if($encoding === 'UCS-4BE') {
			list(, $ord) = (strlen($char) === 4) ? @unpack('N', $char) : @unpack('n', $char);
			return $ord;
		} else {
			return $this->mb_ord(mb_convert_encoding($char, 'UCS-4BE', $encoding), 'UCS-4BE');
		}
	}
	
	
	function mb_htmlentities($string, $hex = true, $encoding = 'UTF-8') {
		return preg_replace_callback('/[\x{80}-\x{10FFFF}]/u', function ($match) use ($hex) {
			return sprintf($hex ? '&#x%X;' : '&#%d;', $this->mb_ord($match[0]));
		}, $string);
	}
}


?>