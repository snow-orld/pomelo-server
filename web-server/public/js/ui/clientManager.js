define(['jquery', 'config', 'switchManager', 'messageHandler'], function($, config, switchManager, messageHandler) {

	var clientManager = function() {
		this.pomelo = window.pomelo;
		
		this.httpHost = location.href.replace(location.hash, '').replace('#', '');
	}
	
	pomelo.on('websocket-error', function() {
		alert(httpHost + ': Websocket error!');
		//clientManager.loading = false;
	});
	
	/**
	 * Initiate client Manager
	 */
	clientManager.prototype.init = function() {
		// bind events
		$('#userLoginFrame a').on('click', gotoRegister);
		$('#userRegFrame a').on('click', gotoLogin);
		$('#regBtn').on('click', register.bind(this));
		$('#loginBtn').on('click', login.bind(this));
		$('#newPlayerBtn').on('click', createPlayer);
		$('#logout').on('click', logout);
		// test server buttons
		$('#testGate').on('click', testGateServer);
		$('#testConnector').on('click', testConnectorServer);
		// auto login for p1, p2
		$('#p1').on('click', autoLogin);
		$('#p2').on('click', autoLogin);
	};
	
	function gotoRegister() {
		$('#userRegFrame').removeClass('g-hide');
		$('#userLoginFrame').addClass('g-hide');
	}
	
	function gotoLogin() {
		$('#userRegFrame').addClass('g-hide');
		$('#userLoginFrame').removeClass('g-hide');
	}
	
	/**
	 * register
	 */
	function register() {
		var username = $('#regName').val().trim();
		var password = $('#regPwd').val().trim();
		var cpassword = $('#regCpwd').val().trim();
		$('#reg-pwd').val('');
    $('#reg-cpwd').val('');
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
			alertResponse(httpHost + 'register', data);
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
		$('#loginPwd').val('');
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
		
			alertResponse('httpHost/login', data);
		
			if (data.code === 501) {
				alert('Username or password is invalid!');
				return;
			}
			if (data.code !== 200) {
				alert('User does not exist!');
				return;
			}
			
			authEntry(data.uid, data.token, function() {
				console.log("user login succeeded.");
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
			host = config.GATE_HOST;	// set the host of connector server accessible from outside client
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
				messageHandler.init();
				
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
					alert("The name already exists!");
					return;
				}
				
				// alert the response from connector.entryHandler
				//alertResponse('connector.carModelHandler.createPlayer', data);
				
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
	 * after login
	 *
	 * @param		{Object}	data	Player data
	 */
	function afterLogin(data) {
		// enter scene !
		var userData = data.user;	// 3/7/17: entryHandler.entry only responds {code, player}, no user
		var playerData = data.player;
		
		var areaId = playerData.areaId;
		
		if (!!userData) {
			pomelo.uid = userData.id;
		}
		pomelo.playerId = playerData.id;
		pomelo.areaId = areaId;
		pomelo.player = playerData;
		
		// for now skip the load process, directly enterscene
		loadResource({jsonLoad: true}, function() {
			enterScene();
		});
	}
	
	/**
	 * load resource
	 */
	function loadResource(opt, callback) {
		//switchManager.selectView('loadingPanel');
		
		// loading page event code not copied
		if (callback) {
			setTimeout(function() {
				callback();
			}, 500);
		}
	}
	
	/**
	 * enter scene
	 */
	function enterScene() {
		// 3/7/17: game-server does not run area Management for now, do it locally
		pomelo.request('area.playerHandler.enterScene', {content: 'Hello!'}, function(data) {
			alertResponse('area.playerHandler.enterScene', data);
			
			pomelo.request('area.pawnHandler.register', {content: ['1', '2', '3', '4']}, function(data) {
				alertResponse('area.pawnHandler.register', data);
			});
			
			//pomelo.request('area.playerHandler.enterGame', null, function(data) {
			//	alertResponse('area.playerHandler.enterGame', data);
				
				var msg = {
					content: 'sync',
					uuid : '1',
					position: [100,0,100],
					quaternion: [1,1,1,1],
					velocity: [2,2,2],
					steering: [3,3,3,3]
				};/*
				pomelo.request('area.playerHandler.update', msg, function(data) {
					alertResponse('area.playerHandler.update', data);
				});*/
				/*
				setInterval(function() {
					pomelo.request('area.playerHandler.update', msg, function(data) {
						alertResponse('area.playerHandler.update', data);
					});
				}, 200);
				*/

			//});
		});
		
	}
	
	/**
	 * test game server
	 * route: gate.gateHandler.queryEntry
	 */
	function testGateServer() {
		var uid = '1';
		var token = 'c8ab13f4bda17c7812ae1e47c2f69b63';
		authEntry(uid, token, function(){ alert('authENtry done!'); });
	};
	
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
	
	/**
	 * auto login for user, to avoid clientManger failing to run through queryEntry problem
	 *
	 * 3/8/17: this in the function points to the whole html element clicked
	 *
	 */
	function autoLogin() {
		console.log('autoLogin by ' + this.id + '');
		
		var uid = '';
		if (this.id == 'p1') uid = '1';
		else if (this.id == 'p2') uid = '2';
		
		var tokens = ['c8ab13f4bda17c7812ae1e47c2f69b63', 'c04b7d0de90ff8d8b65f3d281af8b3c8'];
		
		if(!uid || !tokens[uid - 1]) {
			alert('wrong uid! uid = ' + uid);
			return;
		}
		
		authEntry(uid, tokens[uid - 1]);
	}
	
	/**
	 * Logout, send resquest to server tell the server to close the session
	 * 3/12/17: or just pomelo.disconnect? - after relogin, p1 recieves twice msg of 'userLeave' once p2 left
	 */
	function logout() {
		pomelo.disconnect();
	};
	 
	/**
	 * Benchmarking test functions 
	 *
	 * 3/16/17: cannot run in a single browser tab (next connection connects when previous connections remain open)
	 *
	 */
	function benchmark() {
		console.log('benchmarking test for ' + this.id);

		var self = this;
		var N = Number($('select[name="unit_concurrency"]').val());
		
		function noAuthEntry(uid, host, port) {
		
			if (host === '127.0.0.1') {
				host = config.GATE_HOST;	// set the host of connector server accessible from outside client
			}
			
			pomelo.init({host: host, port: port, log: true}, function() {
			
				switch(self.id) {
				
					case 'unit_connection':				
						pomelo.request('connector.noAuthEntryHandler.entry', {uid: i}, function(data) {
							alertResponse('connector.noAuthEntryHandler.entry', data);
							console.log(i + ' connected: ' + data.code);
						});
						break;
			
					default: 
						console.log('unknown benchmarking test function for', self.id)
				}
				
			});
		}
		
		for (var i = 1; i <= N; i++) {
			var uid = i;
			queryEntry(uid, function(host, port) {
				noAuthEntry(uid, host, port);
			});
		}
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



