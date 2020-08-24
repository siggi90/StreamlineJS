<?
/*if($_SERVER['HTTP_ORIGIN'] == "https://www.noob.software") {
	header("Access-Control-Allow-Origin: https://www.noob.software");
} else {
	header("Access-Control-Allow-Origin: https://noob.software");
}*/

$modules = array(
	'cloud',
	'update'
);

include "../base/actions.php";

?>