var tokenService = require('../../../../../shared/token');
var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');

var DEFAULT_SECRET = 'pomelo_session_secret';
var DEFAULT_EXPIRE = 6 * 60 * 60 * 1000;	// default session expire time: 6 hours

module.exports = function(app) {
	return new Remote(app);
};

var Remote = function(app) {
	this.app = app;
	var session = app.get('session') || {};
	this.secret = session.secret || DEFAULT_SECRET;
	this.expire = session.expire || DEFAULT_EXPIRE;
};

/**
 * Auth token and check whether expire
 *
 * @param		{String} 		token token string
 * @param		{Function}	cb
 * @return	{void}
 */
Remote.prototype.auth = function(token, cb) {
	var res = tokenService.parse(token, this.secret);
	
	console.log('[DEBUG]auth func @ auth.authRemote: token=' + token + ', parsed={uid:' + res.uid + ', timestamp:' + res.timestamp + '}');
	
	if (!res) {
		cb(null, Code.ENTRY.FA_TOKEN_ILLEGAL);
		return;
	}
	
	if (checkExpire(res, this.expire)) {
		cb(null, Code.ENTRY.FA_TOKEN_EXPIRE);
		return;
	}
	
	userDao.getUserById(res.uid, function(err, user) {
		if (err) {
			cb(err);
			return;
		}
		
		// debug
		var debugStr = '[DEBUG]auth func @ auth.authRemote: token is valid. user got by token.uid from userDao is {'
		for (var p in user) {
			debugStr += p + ':' + user[p] + ',';
		}
		debugStr += '}';
		console.log(debugStr);
		
		cb(null, Code.OK, user);
	});
}

/**
 * Check whether the token expires.
 *
 * @param		{Object}	token 	token info {uid, timestamp}
 * @param		{Number}	expire	expire time
 * @return 	{Boolean}	true for expire, false for not expire
 */
var checkExpire = function(token, expire) {
	if (expire < 0) {
		// negative expire means never expires
		return false;
	}
	
	return (Date.now() - token.timeStamp) >= expire;
};
