app.encryption = {
	master_key: null,
	init: function(passphrase) {
		this.master_key = passphrase;//CryptoJS.AES.encrypt(passphrase, "Noob");	
		//this.master_key = passphrase;
	},
	split_key: function(key_value, key_key) {
		var key_value_splits = Array();
		var key_key_splits = Array();
		
		var counter = 0;
		var sub_counter = 0;
		var key_value_value = "";
		var key_key_value = "";
		
		var key_value_decrypted_split = key_value.split("");
		var key_key_decrypted_split = key_key.split("");
		
		while(counter < key_value_decrypted.length) {
			key_value_value += key_value_decrypted_split[counter];
			key_key_value += key_key_decrypted_split[counter];
			
			if(sub_counter == 7) {
				key_value_splits.push(key_value_value);
				key_key_splits.push(key_key_value);
				key_value_value = "";
				key_key_value = "";
				
				sub_counter = -1;	
			}
			sub_counter++;
			counter++;	
		}
		return {
			key_value: key_value_splits,
			key_key: key_key_splits
		};
	},
	start_session: function() {
		var branch = this;
		/*$.post(branch.root.actions, {
			'action': 'random_key',
			'digits': 2
		}, function(data) {
			alert(data);
		});*/
		var k = this.string(8);
		
		branch.k = k;
				
		$.post(branch.root.actions, {
			'action': '_enc_get_values',
			'k': k	
		}, function(data) {
			if(data.key_value != null) {
				var key_value_decrypted = CryptoJS.AES.decrypt(data.key_value, branch.master_key);
				console.log(key_value_decrypted);
				key_value_decrypted = CryptoJS.enc.Utf8.stringify(key_value_decrypted);
				var key_key_decrypted = CryptoJS.AES.decrypt(data.key_key, branch.master_key);
				console.log(key_key_decrypted);
				key_key_decrypted = CryptoJS.enc.Utf8.stringify(key_key_decrypted);
				
				alert(key_key_decrypted);
				alert(key_value_decrypted);
				
				var decrypted = branch.decrypt(key_value_decrypted, key_key_decrypted);
				alert(decrypted);
				
			} else {
				var m = branch.string(8);
				alert('m_value: '+m);
				var post_data = branch.encrypt(k, m);
				post_data.action = 'enc_set_values';
				post_data.k = branch.k;
				$.post(branch.root.actions, post_data, function(data) {
					branch.m = m;
				});
			}
		}, "json");
	},
	string: function(length) {
		var counter = 0;
		var string = "";
		while(counter < length) {
			string += ""+this.integer(0, 10);
			counter++;	
		}
		return string;
	},
	integer: function(min, max) {
		return Math.floor(Math.random() * (max - min) ) + min;
	},
	encrypt: function(k, m) {
		var branch = this;
		k = parseInt(k);
		m = parseInt(m);
		/*alert(branch.master_key);
		alert((k*m)+"");
		alert((Math.log(k)*Math.log(m))+"");
		alert(CryptoJS.AES.encrypt((k*m)+"", branch.master_key));
		alert(CryptoJS.AES.encrypt((Math.log(k)*Math.log(m))+"", branch.master_key));*/
		alert('k*m');
		alert(k*m);
		alert((Math.log(k)*Math.log(m))+"");
		//alert(parseInt(k)*parseInt(m));
		var key_key = CryptoJS.enc.Utf8.parse((k*m)+"");
		var key_value = CryptoJS.enc.Utf8.parse((Math.log(k)*Math.log(m))+"");
		var key_key_encrypted = CryptoJS.AES.encrypt(key_key, branch.master_key);
		var key_value_encrypted = CryptoJS.AES.encrypt(key_value, branch.master_key);
		
		/*var decrypted = CryptoJS.AES.decrypt(key_key_encrypted.toString(), branch.master_key);
		console.log(CryptoJS.enc.Utf8.stringify(decrypted));
		alert('decrypted');
		alert(CryptoJS.enc.Utf8.stringify(decrypted));
			
		/*var key_key_encrypted = {
			ciphertext: key_key_encrypted.ciphertext,
			key: {
				sigBytes: key_key_encrypted.key.sigBytes,
				words: key_key_encrypted.key.words
			},
			iv: key_key_encrypted.iv,
			//algorithm: encrypted.algorithm,
			//mode: key_key_encrypted.mode,
			padding: key_key_encrypted.padding,
			blockSize: key_key_encrypted.blockSize,
			formatter: key_key_encrypted.formatter,
			salt: key_key_encrypted.salt
		};
		
		var key_value_encrypted = {
			ciphertext: key_value_encrypted.ciphertext,
			key: {
				sigBytes: key_value_encrypted.key.sigBytes,
				words: key_value_encrypted.key.words
			},
			iv: key_value_encrypted.iv,
			//algorithm: encrypted.algorithm,
			//mode: key_value_encrypted.mode,
			padding: key_value_encrypted.padding,
			blockSize: key_value_encrypted.blockSize,
			formatter: key_value_encrypted.formatter,
			salt: key_value_encrypted.salt
		};*/
		
		var result = {
			key_key: key_key_encrypted.toString(),
			key_value: key_value_encrypted.toString()
		};
		console.log(result);
		return result;
	},
	decrypt: function(k_log_m_log, km) {
		k_log_m_log = parseFloat(k_log_m_log);
		km = parseInt(km);
		var log_km = Math.log(km);
		var log_km_2 = Math.pow(log_km, 2);
		
		var log_k_log_m = k_log_m_log;
		
		var ab = log_km_2 / log_k_log_m;
		
		var ab_value = ab - 2;
		ab_value = ab_value * log_km;
		var e_value = Math.exp(ab_value);
		
		var inverse_value = Math.pow(e_value, 1/ab);
		var inverse_km = Math.pow(km, 1/ab);
		var value = inverse_value * inverse_km;
		value = Math.pow(value, ab);
		value /= km*km;
		value /= km;
		
		var log_2_k_log_2_m = log_km_2 - (log_k_log_m*2);
		var log_k_log_m_squared = log_k_log_m * log_k_log_m;
		
		var a_squared_b_squared = log_2_k_log_2_m / log_k_log_m_squared;
		
		a_squared_b_squared = a_squared_b_squared * log_km_2;
		
		var a_subtract_b = a_squared_b_squared - (ab * 2);
		
		a_subtract_b = Math.pow(a_subtract_b, 1/2);
		
		value = Math.pow(value, 1/a_subtract_b);
		
		var k_squared = value * km;
		var k = Math.pow(k_squared, 1/2);
		
		var k_guess = Math.round(k);
		
		return k_guess;
	},
	numrand: {
			
	}
};
/*
	Scenario 1.
		-User receives inital private key
		-user stores public key in local storage
		-user logs out
		-user logs back in restores private key with public key
		
	Scenario 2.
		-php script receives k0 (key)
		-javascript recieves key, key is deleted from php memory store hashed k0
		-javascript encrypts m0 with k0
		-php script (A) writes data (m0 encrypted) to Database using k0 as key passs to write
		-javascript script passes public key to php
		-php script (b) has public key reads from database m0.
		
	m0 is never readable by php.
		
		

*/