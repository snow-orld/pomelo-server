define(['jquery', 'config'], function($, config) {

	var clientManager = function() {
		this.pomelo = window.pomelo;
		
		this.httpHost = location.href.replace(location.hash, '').replace('?', '');
	}
	
	this.pomelo.on('websocket-error', function() {
		alert(httpHost + ': Websocket error!');
	});
	
	/**
	 * Initiate client Manager
	 */
	clientManager.prototype.init = function() {
		// bind events
		$('#regBtn').on('click', register.bind(this));
		$('#loginBtn').on('click', login.bind(this));
	};
	
	/**
	 * register
	 */
	function register() {
		var username = $('#regName').val().trim();
		var password = $('#regPwd').val().trim();
		var cpassword = $('#regCpwd').val().trim();
		var httpHost = this.httpHost;
		
		if (!username) {
			alert("Username is required!");
			return;
		}
		
		if (!password) {
			alert("Pssword is required!");
			return;
		}
		
		if (password != cpassword) {
			alert("Entered passwords not match!");
		}
		
		$.post(httpHost + 'register', {username: username, password: password}, function(data) {
			alert('post result: ', data);
			if (data.code === 501) {
				alert("User already exists!");
				return;
			} else if (data.code !== 200) {
				alert("Register fail!");
				return;
			} 
			
			authEntry(data.uid, data.token, function() {
				console.log("user authentication succeeded.");
				alert(username + ' registered and logged in!');
			});
		});

	}
	
	/**
	 * login
	 */
	function login() {
		var username = $('#loginName').val().trim();
		var password = $('#loginPwd').val().trim();
		var httpHost = this.httpHost;

		if (!username) {
			alert('Username is required!');
			return;
		}
		
		if (!password) {
			alert('Password is required!');
			return;
		}
		
		$.post(httpHost + 'login', {username: username, password: password}, function(data) {
			console.log('post result: ', data)
			if (data.code === 501) {
				alert('Username or password is invalid!');
			}
			if (data.code !== 200) {
				alert('User does not exist!');
			}
			
			authEntry(data.uid, data.token, function() {
				console.log('user authentication succeeded.');
				alert(username + ' logged in!');
			});
			
			// set username in localStorage
			localStorage.setItem('username', username);
		});
	}
	
	/**
	 * authEntry
	 */
	function authEntry(uid, token, callback) {
		queryEntry(uid, function(host, port) {
			entry(host, port, token, callback);
		});
	}
	
	pomelo.authEntry = authEntry;
	/**
	 * queryEntry
	 * first connect to gate server to get authenticated with a token
	 * route: gate.gateHandler.queryEntry
	 * response:
	 *	{
	 *		code: [number]
	 *	}
	 */
	function queryEntry(uid, callback) {
		pomelo.init({host: config.GATE_HOST, port: config.GATE_PORT, log: true}, function() {
			pomelo.request('gate.gateHandler.queryEntry', {uid: uid}, function(data) {
				pomelo.disconnect();
				
				if (data.code === 2001) {
					alert('Server error!');
					return;
				}
				
				callback(data.host, data.port);
			});
		});
	}
	
	/**
	 * enter game server
	 * route: connector.entryHandler.entry
	 * response:
	 * 	{
	 *		code: [Number],
	 *		player: [object]
	 * 	}
	 */
	function entry(host, port, token, callback) {
		
		// init socketClient
		// TODO for development - 2/27/17 me: WHAT for development? host?
		
		if (host === '127.0.0.1') {
			host = config.GATE_HOST;	//? go back to gate server?
		}
		
		pomelo.init({host: host, port: port, log: true}, function() {
			pomelo.request('connector.entryHandler.entry', {token: token}, function(data) {
				
				if (callback) {
					callback(data.code);
				}
				
				if (data.code == 1001) {
					alert('Login fail!');
					return;
				} else if (data.code == 1003) {
						alert('Username does not exist!');
						return;
				}
				
				if (data.code != 200) {
					alert('Login Failed!');
					return;
				}
				
				// init handler
				loginMsgHandler.init();
			
			});
		});
	}
	
	return clientManager;
	
});



