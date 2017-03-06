var pomelo = require('pomelo');
var bcrypt = require('bcrypt');
var utils = require('../util/utils');
var User = require('../domain/user');
var Player = require('../domain/entity/player');
var consts = require('../consts/consts');

var userDao = module.exports;

/**
 * Get user data by username.
 *
 * @param {String} username
 * @param {String} passwd
 * @param {function} cb
 *
 */
userDao.getUserInfo =  function(username, passwd, cb) {
	var sql = 'select * from User where name = ?';
	var args = [username];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res){
		if (err !== null) {
			utils.invokeCallback(cb, err, null);
		} else {
			var userId = 0;
			if (!!res && res.length === 1) {
				var rs = res[0];
				userId = res.id;	// no where to use
				rs.uid = rs.id;
				utils.invokeCallback(cb, null, rs);
			} else {
				// 2/28/17 ME ASKS: this is not congruent with the next function getUserByName
				utils.invokeCallback(cb, null, {uid: 0, username: username});
			}
		}
	// 2/28/17 ME ASKS: What is the difference between get one or more entries with this username from db?
	});
};

/**
 * Get user info by username
 *
 * @param {String} username
 * @param {function} cb
 *
 */
userDao.getUserByName = function(username, cb) {
	var sql = 'select * from User where name = ?';
	var args = [username];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.length === 1) {
				var rs = res[0];
				// 2/28/17 ME ASKS: why create new user with rs?
				var user = new User({id: rs.id, name: rs.name, password: rs.password, salt: rs.salt, from: rs.from});
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb, ' user does not exist ', null);
			}
		}
	});
};

/**
 * Get user info by userId
 *
 * @param {String} uid userId
 * @param {function} cb Callback function
 *
 */
userDao.getUserById = function(uid, cb) {
	var sql = 'select * from User where id = ?';
	var args = [uid];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
			//return;
		}
		
		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, new User(res[0]));
		} else {
			utils.invokeCallback(cb, ' user does not exist ', null);
		}
	});
};

/**
 * Delete user by username
 *
 * @param {String} username
 * @param {function} cb Callback function
 *
 */
userDao.deleteByName = function (username, cb) {
	var sql = 'delete from User where name = ?';
	var args = [username];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.affectedRows > 0) {
				utils.invokeCallback(cb, null, true);
			} else {
				utils.invokeCallback(cb, null, false);
			}
		}
	});
};

/**
 * Create a new user
 *
 * @param {String} username
 * @param {String} password
 * @param {String} from  Register source
 * @param {function} cb Callback function
 *
 */
// 2/28/17 ME Question: getUserByName and getUserById all include creating a new user and return it. when to use which?
userDao.createUser = function(username, passwrod, from ,cb) {
	var sql = 'insert into User (name, password, salt, `from`, loginCount, lastLoginTime) values (?,?,?,?,?,?)';
	var loginTime = Date.now();
	var saltRounds = 10;
	
	bcrypt.genSalt(saltRounds, function(err, salt) {
		if (err !== null) {
			console.log('[ERROR]create new user(userDao.js): bcrypt getSalt error');
			return;
		}
		
		bcrypt.hash(password, salt, function(err, hash) {
			if (err !== null) {
				console.log('[ERROR]create new user(userDao.js): bcrypt hash error');
			}
		
			var args = [username, hash, salt, from || '', 1, loginTime];
			
			pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
				if (err !== null) {
					utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
				}	else {
					// 2/28/17 ME: should returned user.password be the plaintext or the hash?
					var user = new User({id: res.insertId, name: username, password: hash, salt: salt, loginCount: 1, lastLoginTime: loginTime});
					utils.invokeCallback(cb, null, user);
				}
			});
			
		});
	});
};


/**
 * Get an user's all Players by userId. Used in connector.entryHandler.entry.
 *
 * @param 	{string} 		uid		user id
 * @param		{function}	cb		callback
 *
 */
userDao.getPlayersByUid = function(uid, cb) {
	var sql = 'select * from Player where userId = ?';
	var args = [uid];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}
		
		if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
			return;
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get player by player name. Used in connector.carModleHandler.createPlayer to check if duplicate name.
 *
 * @param		{string}		name		Player name
 * @param		{function}	cb			callback function
 *
 */
userDao.getPlayerByName = function(name, cb) {
	var sql = 'select * from Player where name = ?';
	var args = [name];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			// 3/5/17 ME ASKS: why create new user with rs? but directly returns result in getPlayersByUid()?
			utils.invokeCallback(cb, null, new Player(res[0]));
		}
	});
};

/**
 * Create a new player
 *
 * @param 	{String}		uid		User id
 * @param		{String}		name	Player's name in the game
 * @param		{function}	cb		Callback function
 *
 */
userDao.createPlayer = function(uid, name, cb) {
	// Player(id, userId, name, x, y, areaId, kindId, kindName) 
	// 3/5/17 ME: kindId, kindName not used for now, leave them to default values ('0000', 'universal user')
	var sql = 'insert into Player (userId, name, x, y, areaId, kindId, kindName) values (?,?,?,?,?,?,?)';
	var born = consts.BornPlace;
	var x = born.x + Math.floor(Math.random()*born.width);
	var y = born.y + Math.floor(Math.random()*born.height);
	var areaId = consts.PLAYER.initAreaId;	// 3/5/17 ME: default areaId for entity constructor is 1; but this is not read from db getPlayerByName. this acctually the very first step to CREATE player data!
	// 3/6/17: kindId and kindName can be accessed from dataApi, to be implemented in future extension
	var kindId = '0000';
	var kindName = 'universal user';
	var args = [uid, name, x, y, areaId, kindId, kindName];
	
	pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
		if (err !== null) {
			logger.error('create player failed!' +  err.message);
			logger.error(err);
			utils.invokeCallback(cb, err.message, null);
		} else {
			var player = new Player({
				id: res.insertId,
				userId: uid,
				name: name,
				// 3/5/17 ME: not spcifying x,y in lop. entity create lacks of x,y? OR new player is randomly spawn into map position?
				// 3/6/17 A1: returned player is used for setting session, session does not need store position
				kindId: kindId,
				kindName: kindName
			});
			utils.invokeCallback(cb, null, player);
		}
	});
};
