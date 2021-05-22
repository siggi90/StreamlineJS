app.ws = {
	client_id: -1,
	connection: null,
	remote_description: null,
	ice_candidate: null,
	messages: Array(),
	messages_by_id: {},
	is_nc: false,
	get_messages: function() {
		var return_result = this.messages.splice(0, this.messages.length);
		for(var x in return_result) {
			delete this.messages_by_id[return_result[x].message_id];
		}
		return return_result;
	},
	last_callback: null,
	init: function(is_nc, callback, ws_server, callback_2) {
		var branch = this;
		branch.is_nc = is_nc;
		//branch.log('init WS -----');
		if(typeof callback !== 'undefined' && callback != null) {
			branch.last_callback = callback;
		} else if(typeof branch.last_callback !== 'undefined') {
			callback = branch.last_callback;
		}
		if(typeof ws_server === 'undefined') {
			return;
			ws_server = 'noob.software:10443';
		}

		var conn = new WebSocket('wss://'+ws_server); //
		branch.connection = conn;
		conn.onmessage = async function(e) { 
			//branch.log('recieved');
			//branch.log(e.data);
			var message_data = JSON.parse(e.data);
			switch(message_data.action) {
				case 'get_nc':
					break;
				case 'login_response':
					branch.client_id = message_data.client_id;
					if(message_data.logged_in) {
						callback();
						//branch.current_nc_id = message_data.nc_id;
						//branch.make_peer_connection();
						/*branch.root.user_id = message_data.user_id;
						//
						alert('logged_in');
						alert(message_data.user_id);*/	
					}
					break;
				case 'sdp':
				case 'ice':
					/*const remote_description = new RTCSessionDescription(message_data.message);
					if(branch.peer_connection != null) {
						await branch.peer_connection.setRemoteDescription(remote_description);
					} else {
						branch.remote_description = remote_description;	
					}
					if(branch.peer_connection != null) {
						await branch.peer_connection.addIceCandidate(message_data.message);
					} else {
						branch.ice_candidate = message_data.message;	
					}*/
					//branch.log('object_signal');
					//branch.log(message_data.message);
					if(branch.peer_connection != null) {
						branch.peer_connection.signal(message_data.message);
					}/* else {
						branch.peer_connection_unread_data.push(message_data.message);	
					}*/
					break;
				default:
					/*if(branch.is_nc) {
						branch.messages.push(message_data);
					} else {
						console.log(message_data);
					}*/
					branch.messages.push(message_data);
					branch.messages_by_id[message_data.message_id] = message_data;
					break;	
			}
			 
		};
		conn.onopen = function(e) { 
			branch.ws_connected = "1";
			if(branch.is_nc) {
				branch.nc_login_init_post();
			}
			if(typeof callback_2 !== 'undefined') {
				callback_2();
			}
		};
		conn.onclose = function(e) {
			branch.ws_connected = "0";
			branch.client_id = -1;
		};


		
	},
	close_connection: function() {
		var branch = this;
		branch.connection.close();
		branch.ws_connected = "0";
		branch.client_id = -1;
	},
	reset_connection: async function() {
		var branch = this;
		if(branch.ws_connected == "0") {
			this.init(true);
			var timeout_count = 0;
			while(branch.ws_connected == "0" && timeout_count < 100) {
				await branch.root.delay(1350);
				timeout_count++;
			}
			if(timeout_count == 100) {
				return {
					connected: 'timeout'
				};
			}
		}
		return {
			connected: 'true'
		};
	},
	ws_connected: "0",
	get_nc_status: function() {
		var branch = this;
		var status = {
			client_id: branch.client_id,
			ws_connected: branch.ws_connected
		};
		return status;
	},
	client_login_init: async function() {
		var branch = this;

		$.post(branch.root.actions, {
			'action': 'get_ws_server'
		}, function(data) {
			branch.init(false, function() {

			}, data, function() {

				var message_data = {
					'action': 'login',
					'username': branch.root.user_menu.username,
					'password': branch.root.user_menu.password
				};
				branch.connection.send(JSON.stringify(message_data));
			});
		});

		return true;
	},
	nc_login_init_post: function() {
		var branch = this;
		if(branch.nc_login_data != null) {
			branch.connection.send(branch.nc_login_data);
			branch.nc_login_data = null;
		}
	},
	nc_login_data: null,
	nc_login_init: function(data) {
		//branch.connection.send(data);
		//if(branch.
		var branch = this;

		/*if(branch.ws_connected == "0") {
			this.init(true, function() {
				branch.connection.send(data);
			});
		} else {*/
		if(branch.ws_connected == "0") {
			/*return {
				result: "false"
			};*/
			branch.nc_login_data = data;
		} else {
			branch.connection.send(data);
		}
		return {
			result: "true"
		};
	},
	message_id: 0,
	running_messages: 0,
	max_timeout_count: 100000,
	//send_queue: Array(),
	send_nc: function(message) {
		var branch = this;

		//message = message.split('&apos;').join("'");
		//message = message.replace(/\'/g, "'");

		message = message.split('&apos;').join("'");
		var messages = JSON.parse(message);

		for(var x in messages) {
			message = messages[x];

			message = JSON.stringify(message);

			branch.log("send_response: "+message);
			branch.connection.send(message, false);
			
		}
		return {
			valid: true
		}; 
	},
	send: async function(message, await_result) {
		var branch = this;
		/*if(!await_result) {
			//message = message.split('&apos;').join("'");
			//message = message.replace(/\'/g, "'");
			var messages = JSON.parse(message);

			for(var x in messages) {
				message = messages[x];

				message = JSON.stringify(message);
				message = message.split('&apos;').join("'");

				branch.log("send_response: "+message);
				branch.connection.send(message);
				
			}
			return;
		}*/
		var timeout_count = 0;
		while(branch.client_id == -1) {
			await branch.root.delay(350);
			/*//timeout_count++;
			//if(timeout_count == 100) {
				setTimeout(function() {
					branch.root.dialog.init("Lost connection to Noob Cloud, please check your Noob Cloud application, and try again.", undefined, undefined, function() {

					});
					branch.root.dialog.show();
				}, 1250);
				return;
			//}*/
		}
		var message_id = branch.message_id;
		/*if(typeof message === 'string') {
			message = JSON.parse(message);
		}*/
		//console.log('to_send:');
		//console.log(message);
		message.message_id = message_id;
		branch.message_id++;
		branch.running_messages++;
		message.client_id = branch.client_id;
		message.to_nc = true;
		//console.log(message);
		var send_message = JSON.stringify(message);

		/*return {
			ws_message: [{}]
		};*/

		/*if(branch.peer_connection != null) {
			branch.peer_connection.send(send_message);
		} else {*/
			branch.connection.send(send_message);
		//}
		if(await_result) {
			await branch.root.delay(5);
			var timeout_counter = 0;
			while(typeof branch.messages_by_id[message_id] === 'undefined' && timeout_counter < branch.max_timeout_count) {
				await branch.root.delay(150);
				timeout_counter++;
				//console.log(branch.messages_by_id);
			}
			if(timeout_counter == branch.max_timeout_count) {
				return {
					timeout: true
				};
			}
			var return_message = branch.messages_by_id[message_id];
			delete branch.messages_by_id[message_id];
			var index = branch.messages.indexOf(return_message);
			branch.messages.splice(index, 1);
			branch.running_messages--;
			if(branch.running_messages == 0) {
				branch.message_id = 0;
			}
			/*if(typeof return_message.error !== 'undefined') {

			}*/
			return return_message;
		}
		return true;
	},
	log: function(message) {
		//$('.messages').append(message+"<br>");
	},
	peer_connection: null,
	peer_connection_unread_data: Array(),		
	make_peer_connection: function() {
		var branch = this;		
		//branch.log('init_connection');
		
		var peer = new SimplePeer({ 
				initiator: true, 
				channelName: 'noob_cloud',
				//iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // { urls: 'stun:global.stun.twilio.com:3478' } 
				/*iceServers: [
					{
					    urls: 'turn:numb.viagenie.ca',
					    credential: 'muazkh',
					    username: 'webrtc@live.com'
					},
				]*/
			});
		branch.peer_connection = peer;
		
		peer.on('signal', data => {
			//branch.log(data);
			//peer1.signal(data)
			var message = {
				//'action': 'sdp_nc',
				'action': 'sdp_nc',
				'message': data,
				//'user_id': branch.root.user_id
			};
			branch.connection.send(JSON.stringify(message));
		})

		peer.on('close', () => {
			//branch.log('closed');
			branch.peer_connection = null;
		});
		peer.on('error', err => branch.log(err))

		peer.on('data', data => {
			branch.messages.push(message_data);
		})
		
		peer.on('connect', () => {
			//branch.log('connect');
			//setTimeout(function() {
				//branch.log('send: hey peer2...');
				peer.send('hey peer2, how is it going?')
			//}, 1200);
		})
		
		/*if(branch.peer_connection_unread_data.length > 0) {
			for(var x in branch.peer_connection_unread_data) {
				var item = branch.peer_connection_unread_data[x];
				
				branch.peer_connection.signal(item);
			}
			branch.peer_connection_unread_data = Array();
			
		}*/
	}
};