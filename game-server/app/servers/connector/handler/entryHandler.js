var Code = require('../../../../../shared/code');
//var userDao = require('../../../dao/userDao');	// used for get player info by uid
//var channelUtil = require('../../../util/channelUtil');	// used for chat to get global channel name
//var utils = require('../../../util/utils');	// used for player leaving area server
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;

  if (!this.app) {
  	logger.error(app);
  }
};

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	var token = msg.token;
	var self = this;

	console.log('[DEBUG]entry func @ connector.entryHandler: received token is ' + token);
	
	if (!token) {
		next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
		return;
	}
	
	var uid;
	async.waterfall([
		function(cb) {
			// auth token
			self.app.rpc.auth.authRemote.auth(session, token, cb);
		}, function(code, user, cb) {
			// handle auth result, i.e response from auth server {code, [user]}
			if (code !== Code.OK) {
				next(null, {code: Code});	// when auth not passed, handler next function of entryHandler, <==> responds to clientManager
				return;
			}
			
			if (!user) {
				next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
				return;
			}
			
			uid = user.id;
			
			session.bind(uid, cb);
			
			// DEBUG ~ begin
			var debugStr = '[DEBUG]entry func @ connector.entryHandler: token validated. user is {'
			for (var p in user) {
				debugStr += p + ':' + user[p] + ',';
			}
			debugStr += '}';
			console.log(debugStr);
			
			debugStr = '[DEBUG]entry func @ connector.entryHandler: session binded. session is {'
			debugStr += session;
			console.log(debugStr);
			// DEBUG ~ end
			
			
		}
	], function(err) {
		if (err) {
			next(err, {code: Code.FAIL});
			return;
		}
	});
	
	// for test connector server only - send response before async.waterfall completes
  next(null, {code: Code.OK, msg: 'connector server is ok.'});
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
	};
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
	};
  next(null, result);
};
