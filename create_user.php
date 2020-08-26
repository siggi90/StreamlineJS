<?
	/*
		This script is intended to initialize Streamline with an Admin user. If you intend to use Noob Cloud for Noob Apps to do not use this script.
	*/

	include 'base/base.php';
	
	class create_user extends base {
		function create_user($email, $password, $user_id) {
			parent::__construct('app', "/base");
			$v = array(
				'email' => $email,
				'password' => $password,
				"user_id" => $user_id
			);	
			$this->statement->generate($v, "app.users");
			$this->sql->execute($this->statement->get(), NULL, true);
			$user_id = $this->sql->last_id($v);
			
			$v = array(
				'user_id' => $user_id,
				'user_group_id' => 2
			);		
			$this->statement->generate($v, "app.user_user_groups");
			$this->sql->execute($this->statement->get(), NULL, true);
		}
	}
	
	$create_user = new create_user('admin', 'admin', -1); //your username and password here

?>