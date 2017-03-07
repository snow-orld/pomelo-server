var Code = require('../../../../../shared/code');	// 3/5/17: carModelHandler uses consts/consts for code. Unify the two!
var userDao = require('../../../dao/userDao');	// used for get player info by uid
var channelUtil = require('../../../util/channelUtil');
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
			
			userDao.getPlayersByUid(user.id, cb);
			
			// DEBUG ~ begin
			var debugStr = '[DEBUG]entry func @ connector.entryHandler: token validated. user is {'
			for (var p in user) {
				debugStr += p + ':' + user[p] + ',';
			}
			debugStr += '}';
			console.log(debugStr);
			// DEBUG ~ end
			
		}, 
		function(res, cb) {
			// generate session and register chat status - till the end of async.waterfall
			players = res;
			
			// DEBUG ~ begin
			var debugStr = '[DEBUG]entry func @ connector.entryHandler: got players by uid. player is {'
			for (var p in players[0]) {
				debugStr += p + ':' + players[0][p] + ',';
			}
			debugStr += '}';
			console.log(debugStr);
			// DEBUG ~ end
			
			// close all sessions associated with uid
			self.app.get('sessionService').kick(uid, cb);
		}, 
		function(cb) {
			session.bind(uid, cb);
		}, 
		function(cb) {
			if (!players || players.length === 0) {
				next(null, {code: Code.OK});
				return;
			}
			
			player = players[0];
			
			//session.set('serverId', self.app.get('areaIdMap')[player.areaId]);
			session.set('playername', player.name);
			session.set('playerId', player.id);
			session.on('closed', onUserLeave.bind(null, self.app));
			session.pushAll(cb);
		},
		function(cb) {
			self.app.rpc.chat.chatRemote.add(session, player.userId, player.name,
				channelUtil.getGlobalChannelName(), cb);
		}
	], function(err) {
		if (err) {
			next(err, {code: Code.FAIL});
			return;
		}
		
		// return user or player info back to client
		next(null, {code: Code.OK, player: players ? players[0] : null});
	});
};

// 3/5/17 ME: session closed handler differs the one in connector.carModelHdler.createPlayer. HOW and WHY? A: does not pass app as param. get app from pomelo.app
var onUserLeave = function(app, session, reason) {
	if (!session || !session.uid) {
		return;
	}
	
	/*
	utils.myPrint('1 ~ connector.entryHandler.onUserLeaving is running ...');
	app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('palyerId'), instanceId: session.get('instanceId')}, function(err) {
		if (!!err) {
			logger.error('user leave error! %j', err);
		}
	});
	*/
	app.rpc.chat.chatRemote.kick(session, session.uid, null);
}

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
