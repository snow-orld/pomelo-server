var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var EVENT = require('../../../consts/consts').EVENT;
//var messageService = require('../../../services/messageService');

module.exports = function(app) {
	return new PlayerRemote(app);
};

var PlayerRemote = function(app) {
	this.app = app;
};

/**
 * Player exists. It will persistent player's state in the database.
 *
 * 3/9/17 ME: BUG! entryHandler.onUserLeave calls rpc.area.playerRemote(sesion, {pid: xxx}, function), but playerLeave's args = {}
 *
 * @param {Object} args
 * @param {Function} cb
 * @api public
 */
PlayerRemote.prototype.playerLeave = function(args, cb) {
	var playerId = args.playerId;
	var area = this.app.areaManager.getArea(args.instanceId);	// 3/9/17 ME: scene.js getArea does not take any args?
	var player = area.getPlayer(playerId);
	
	if (!player) {
		logger.warn('player not in the area ! %j', args);
		utils.invokeCallback(cb);
		return;
	}
	
	// 3/9/17: update data to db - skipped
	area.removePlayer(playerId);
	area.channel.pushMessage({route: EVENT.USERLEAVESCENE, code: 200, playerId: playerId});
	utils.invokeCallback(cb);
};


