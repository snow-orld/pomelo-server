var messageService = require('../../../services/messageService');
//var areaService = require('../../../services/areaService');		// for change area
var userDao = require('../../../dao/userDao');
//var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
//var dataApi = require('../../../util/dataApi');
var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');
var EVENT = require('../../../consts/consts').EVENT;

var handler = module.exports;

/**
 * Player enter scene, and response the related information such as
 * playerInfo, areaInfo and mapData to client.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.enterScene = function(msg, session, next) {
	var area = session.area;	// 3/7/18 ME: where does it get set, areaServer? 3/8/18 ME: session.area is set in the area.playerFilter
	var playerId = session.get('playerId');
	var areaId = session.get('areaId');
	
	userDao.getPlayerAllInfo(playerId, function(err, player) {
		if (err || !player) {
			logger.error('Get player for userDao failed! ' + err.stack);
			next(new Error('fail to get player from database', {
				route: msg.route,
				cdoe: consts.MESSAGE.ERR
			}));
			
			return;
		}
		
		player.serverId = session.frontendId;
		areaId = player.areaId;
				
		// for carSync demo
		var data = {
			entities: area.getAreaInfo(),	// get entities in the area
			curPlayer: player.getInfo()
		}
		
		next(null, data);
		
		/**
		 * 3/9/17 ME: for carSync Demo this is not necessary. 
		 * BUT, do we need to pushMessageToArea about new entities added to area if client side does not periodically send its 
		 * status data to server? - probably yes. Do it right now. Make previously logged in user see a new car when new user enter
		 *//*
		if (!area.addEntity(player)) {
			logger.error('Add player to area failed! areadId : ' + player.areaId);
			next(new Error('fail to add user into area'), {
				route: msg.route,
				code: consts.MESSAGE.ERR
			});

			return;
		}
		
		// push new entity added message to area, including route, and the added player info
		var msg = {player: player.getInfo()};
		var ignoreList = {};
		ignoreList[player.userId] = true;
		//messageService.pushMessageToArea(area, EVENT.USERENTERSCENE, msg, ignoreList);
		// 3/16/17: change to Server periodically broadcast getAreaInfo()
		*/
	});
};

/**
 * Player decide to be a player in the scene, add player as an entity to area!
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.enterGame = function(msg, session, next) {
	var area = session.area;
	var playerId = session.get('playerId');
	var areaId = session.get('areaId');
	
	userDao.getPlayerAllInfo(playerId, function(err, player) {
		if (err || !player) {
			logger.error('Get player for userDao failed! ' + err.stack);
			next(new Error('fail to get player from database', {
				route: msg.route,
				cdoe: consts.MESSAGE.ERR
			}));
			
			return;
		}
		
		player.serverId = session.frontendId;
		areaId = player.areaId;

		if (!area.addEntity(player)) {
			logger.error('Add player to area failed! areadId : ' + player.areaId);
			next(new Error('fail to add user into area'), {
				route: msg.route,
				code: consts.MESSAGE.ERR
			});

			return;
		}
		
		next(null, {code: 200});
	});
	
};

/**
 * Player update. Player requests update its info at server.
 * Handle the request from client, and response result to client
 * Push message by ChannelName to notify other clients about update
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.update = function(msg, session, next) {
	var area = session.area;
	var player = area.getPlayer(session.get('playerId'));

	var position = msg.position;			// array of 3
	var quaternion = msg.quaternion;	//array of 4
	
	player.x = position[0];
	player.y = position[1];
	player.z = position[2];
	player.qx = quaternion[0];
	player.qy = quaternion[1];
	player.qz = quaternion[2];
	player.qw = quaternion[3];
	
	player.car.velocity = msg.velocity;
	player.car.steering = msg.steering;
	
	area.updateEntity(player);
	
	var ignoreList = {};
	ignoreList[session.uid] = true;
	//messageService.pushMessageToArea(area, EVENT.UPDATE, msg, ignoreList);
	
	// periodically broadcast
	if (area.bcInterval == null) {
		area.bcInterval = setInterval(function() {
			messageService.pushMessageToArea(area, EVENT.UPDATE, {entities: area.getAreaInfo()}, null);
			
			if (area.playerNum == 0) {
				clearInterval(area.bcInterval);
				area.bcInterval = null;
			}
		}, consts.BROADCAST.INTERVAL);
	}
	
	next(null, {code: 200});
}; 
 

/**
 * Player moves. Player requests move with the given movePath.
 * Handle the request from client, and response result to client
 * Push message by AOI to notify other clients about moves
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
