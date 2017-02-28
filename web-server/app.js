var express = require('express');
var app = express.createServer();
var bcrypt = require('bcrypt');
var Token = require('../shared/token');
var secret = require('../shared/config/session').secret;
var userDao = require('./lib/dao/userDao');
var mysql = require('./lib/dao/mysql/mysql');
var everyauth = require('./lib/oauth');

app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.set('view engine', 'jade');
  app.set('views', __dirname + '/public');
  app.set('view options', {layout: false});
  app.set('basepath',__dirname + '/public');
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// express router
app.post('/register', function(req, res) {
	console.log('[DEBUG]routing at /register');

	var msg = req.body;
	
	var username = msg.username;
	var password = msg.password;
	if (!username || !password) {
		res.send({code: 500});
		return;
	}
	
	// generate salt
	var saltRounds = 10;
	bcrypt.genSalt(saltRounds, function(err, salt) {
		if (err) {
			console.log('[ERROR]bcrypt: generating salt failed.');
			return;
		}
		
		//console.log('[DEBUG]bcrypt: generated salt length = ', salt.length);
		
		// create hash with salt
		bcrypt.hash(password, salt, function(err, hash) {
			if (err) {
				console.log('[ERROR]bcrypt: create hash failed.');
				return;
			}
			
			//console.log('[DEBUG]bcrypt: encrypted hash length = ', hash.length);
			
			// create new user
			userDao.createUser(username, hash, salt, '', function(err, user) {
				if (err || !user) {
					if (err && err.code === 'ER_DUP_ENTRY') {
						// msyql insert error: duplicate entry for unique col username
						console.log('[ERROR]register: Username already exists!');
						res.send({code: 501});
						return;
					} else {
						console.log('[ERROR]register: Create user error');
						res.send({code: 500});
						return;
					}
				} else {
					console.log('A new user was created! --' + username);
					res.send({code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id});
				}
			});
		});
	});
});

app.post('/login', function(req, res) {
	console.log('[DEBUG]routing at /login');
	
	var msg = req.body;
	var username = msg.username;
	var password = msg.password;
	if (!username || !password) {
		res.send({code: 500});
		return;
	}
	
	userDao.getUserByName(username, function(err, user) {
		if (err || !user) {
			console.log('[ERROR]login: User ' +  username + ' does not exist!');
			res.send({code: 500});
			return;
		}

		//console.log('[DEBUG]login: Retrieved salt length = ', user.salt.length);
		//console.log('[DEBUG]login: Retrieved hash length = ', user.password.length);
				
		// generate hash with retrieved salt and origin pasword, then compare to hash on db
		bcrypt.hash(password, user.salt, function(err, hash) {
			if (err) {
				console.log('[ERROR]bcrypt: restoring hash failed.');
				res.send({code: 501});
				return;
			}
			
			if (hash !== user.password) {
				console.log('[ERROR]login: Wrong password!');
				res.send({code: 501});
			} else {
				console.log(username + ' login!');
				var token = Token.create(user.id, Date.now(), secret);
				console.log('[DEBUG]login: generated token=', token);
				res.send({code: 200, token: token, uid: user.id});
			}
		});
	});
});

// Init mysql
mysql.init();

app.listen(3001);

// Uncaught exception handler
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});

console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");
