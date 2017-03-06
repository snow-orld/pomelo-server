define(['jquery', 'config', 'switchManager'], function($, config, switchManager) {

	var clientManager = function() {
		this.pomelo = window.pomelo;
		
		this.httpHost = location.href.replace(location.hash, '').replace('?', '');
	}
	
	pomelo.on('websocket-error', function() {
		alert(httpHost + ': Websocket error!');
	});
	
	/**
	 * Initiate client Manager
	 */
	clientManager.prototype.init = function() {
		// bind events
		$('#regBtn').on('click', register.bind(this));
		$('#loginBtn').on('click', login.bind(this));
		$('#newPlayerBtn').on('click', createPlayer);
		// test server buttons
		$('#testGate').on('click', testGateServer.bind(this));
		$('#testConnector').on('click', testConnectorServer.bind(this));
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
			alert('$.post result: ', data);
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
		
			if (data.code === 501) {
				alert('Username or password is invalid!');
				return;
			}
			if (data.code !== 200) {
				alert('User does not exist!');
				return;
			}
			
			authEntry(data.uid, data.token, function() {
				console.log('user authentication succeeded.');
				alert(username + ' logged in!');
			});
			
			// set username in localStorage
			localStorage.setItem('username', username);
		});
	}
	
	function ajaxError(jqXHR, textStatus, errorThrown) {
		alert('$.post ' + textStatus + ' : ' + errorThrown);
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
				alertResponse('gate.geteHandler.queryEntry', data);
				pomelo.disconnect();
				
				if (data.code === 2001) {
					alert('Server error!');
					return;
				}
				alert(callback)
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
				var player = data.player;
				
				if (callback) {
					callback(data.code);
				}
				
				if (data.code == 1001) {
					alert('Login failed!');
					return;
				} else if (data.code == 1003) {
						alert('Username does not exist!');
						return;
				}
				
				if (data.code != 200) {
					alert('Login failed!');
					return;
				}
				
				// init handler
				//loginMsgHandler.init();
				//gameMsgHandler.init();
				
				if (!player || player.id <= 0) {
					// switch view to create new player
					switchManager.selectView('carSelectPanel');
				} else {
					// load resource and enter the user into scene
					afterLogin(data);
				}
				
			});
		});
	}
	
	/**
	 * create new player if not any returned from server
	 */
	function createPlayer() {
		var name = $('#playerName').val().trim();
		
		if (!name) {
			alert("Player name is required!");
		} else if (name.length > 9) {
			alert("Player 's name length is too long! (>9)");
		} else {
			pomelo.request('connector.carModelHandler.createPlayer', {name: name}, function(data) {
				if (data.code == 500) {
					alert("Create player fails!");
					return;
				}
				
				// alert the response from connector.entryHandler
				alertResponse('connector.carModelHandler.createPlayer', data);
				
				// if returned player id is not valid ? 3/5/17 ME: in what condition this happens? i.e. this handles what situation?
				if (data.player.id <= 0) {
					switchManager.selectView('loginPanel');
				} else {
					afterLogin(data);
				}
			});
		}
	} 
	
	/**
	 *	after login
	 */
	function afterLogin(data) {
		alert("after login!");
	}
	
	/**
	 * test game server
	 * route: gate.gateHandler.queryEntry
	 */
	function testGateServer() {
		/*
		pomelo.init({
				host: '192.168.239.140',
				port: 3014,
				log: true
			}, function() {
				pomelo.request('gate.gateHandler.queryEntry', {uid: '0'}, function(data) {
					pomelo.disconnect();
					
					// alert the response from gateHandler
					alertResponse('gate.gateHandler.queryEntry', data);
					
				});
			});
		*/
		var uid = '1';
		queryEntry(uid, function(host, port) {
			console.log('gate-server responds:\nhost=' + host + '\nport=' + port);
			var msg = {};
			var token = 'c8ab13f4bda17c7812ae1e47c2f69b63';
			msg['token'] = token;
			entry(host, port, token, function(){});
		});
	}
	
	/**
	 * test connector server with auth server validating token
	 * route: connector.entryHandler.entry
	 */
	function testConnectorServer() {
		var msg = {};
		var token = 'c8ab13f4bda17c7812ae1e47c2f69b63';
		msg['token'] = token;
		
		pomelo.init({
				host: '192.168.239.140',
				//port: '3010',	// connector-server-1
				port: '3011',	// connector-server-2
				log: true
			}, function() {
				pomelo.request('connector.entryHandler.entry', msg, function(data) {
				
					// alert the response from connector.entryHandler
					alertResponse('connector.entryHandler.entry', data);
				
					// switch view if data.player does not exist
					var player = data.player;
					if (!player || player.id <= 0) {
						switchManager.selectView('carSelectPanel');
					} else {
						afterLogin(data);
					}
					
				});
			});
	}
	
	return clientManager;
	
});

/** 
 * helper function - alert the responds data from specified server route
 *
 * @param		{String}		route 		Server route
 * @param 	{Object} 		data 			Server response
 *
 */
var alertResponse = function(route, data) {
	var alertMsg = route + ' responds: {\n';

	for (var p in data) {
		if(data.hasOwnProperty(p)) {
			
			if (typeof data[p] == 'object') {
				alertMsg += '    {\n';
				for (var sp in data[p]) {
					if (data[p].hasOwnProperty(sp)) {
						alertMsg += '    ' + sp + ': ' + data[p][sp] + ',\n';
					}
				}
				alertMsg += '}';
			}	else {
				alertMsg += '    ' + p + ': ' + data[p] + ',\n';
			}
		}
	}
	alertMsg += '}';
	alert(alertMsg);
}



