var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var userDao = require('../../../dao/userDao');
var carDao = require('../../../dao/carDao');
var consts = require('../../../consts/consts');	// 3/5/17 ME: entryHandler uses shared/config/data/code.js for messagecode. unify the two!
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');		// only used for print onUserLeave, i.e. session closed handler
var async = require('async');

module.exports = function(app) {
	return new Handler(app);
}

var Handler = function(app) {
	this.app = app;
}

/**
 * create new player. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.createPlayer = function(msg, session, next) {
	var uid = session.uid;
	var name = msg.name;
	var self = this;
	
	userDao.getPlayerByName(name, function(err, player) {
		if (player) {
			// player name duplicates
			next(null, {code: consts.MESSAGE.ERR});
			return;
		}
		
		// create new player
		userDao.createPlayer(uid, name, function(err, player) {
			if (err) {
				logger.error('[register] fail to invoke createPlayer for ' + err.stack);
				next(null, {code: consts.MESSAGE.ERR, error: err});
				return;
			} else {
			
			/*
				async.parallel([
					// create player related info such as bag, equip, and learn skill, etc.
					// create Car for player for now. if do nothing, the final callback won't run,
					// meaning nothing from server will return to client.
					function(callback) {
						carDao.createCar(player.id, callback);	// 3/8/17 ME: NOT test now, car is manully inserted
					}
				],
				function(err, results) {
					if (err) {
						logger.err(err.message);
						next(null, {code: consts.MESSAGE.ERR, error: err});
						return;
					}
					afterLogin(self.app, msg, session, {id: uid}, player.strip(), next);
				});
			*/
			
				carDao.createCar(player.id, function(err, car) {
					if (err) {
						logger.error(err.message);
						next(null, {code: consts.MESSAGE.ERR, error: err});
						return;
					}
					logger.debug('creating Player: player.strip() is %j', player.strip());
					afterLogin(self.app, msg, session, {id: uid}, player.strip(), next);
				});
			}
		});
	});
};

/**
 * afterLogin - do the same work as in connector.entryHandler's aysnc.waterfall when player exists
 * generate session and register chat status - till the end of async.waterfall
 *
 */
var afterLogin = function(app, msg, session, user, player, next) {
	async.waterfall([
		// 3/5/17 ME: here it skips the get('sessionService').kick(uid, cb) compared to entryHandler. OK?
		function(cb) {
			session.bind(user.id, cb);
		},
		function(cb) {
			session.set('username', user.name);
			session.set('areaId', player.areaId);
			//session.set('serverId', app.get('areaIdMap')[player..areaId]);	// not done yet
			session.set('playername', player.name);
			session.set('playerId', player.id);
			session.on('closed', onUserLeave);
			session.pushAll(cb);
		}/*,
		function(cb) {
			app.rpc.chat.chatRemote.add(session, user.id, player.name, channelUtil.getGlobalChannelName(), cb);
		}*/
	],
	function(err) {
		if (err) {
			logger.error('fail to select car model, (create new player failed) ' + err.stack);
			next(null, {code: consts.MESSAGE.ERR});
			return;
		}
		
		next(null, {code: consts.MESSAGE.RES, user: user, player: player});
	});
}

/**
 * onUserLeave handler function when session is closed
 *
 * 3/5/17 ME: session closed handler differs the one in connector.entryHandler.entry, which passes app as param
 *
 * @param		{Object}		session
 * @param		{String}		reason
 *
 */
var onUserLeave = function(session, reason) {
	if (!session || !session.uid) {
		return;
	}

	utils.myPrint('2 ~ connector.carModelHandler.OnUserLeave is running ...');
	var rpc = pomelo.app.rpc;
	rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), areaId: session.get('areaId')}, function(err) {
		if (!!err) {
			logger.error('user leave error! %j', err);
		}
	});
	//rpc.chat.chatRemote.kick(session, session.uid, null);
	
}
