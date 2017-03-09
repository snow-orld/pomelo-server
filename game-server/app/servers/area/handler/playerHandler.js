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
	var area = session.area;	// 3/7/18 ME: connector does no set area to session when bind sessions. where does it get set, areaServer - backend session? 3/8/18 ME: session.area is set in the area.playerFilter
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
		/*
		// DEBUG ~ begin
		var debugStr = '[DEBUG]enterScene @ area.playerHandler: get playerAllInfo is: {\n';
		for (var p in player) {
			if (typeof player[p] == 'object') {
				debugStr += '  ' + p + ':  {\n';
				for (var sp in player[p]) {
					//if (typeof player[p][sp] != 'function')
						debugStr += '    ' + sp + ': ' + player[p][sp] + ',\n';
				}
				debugStr += '  },\n';
			} else if (typeof player[p] != 'function')
			{
				debugStr += '  ' + p + ': ' + player[p] + ',\n';
			}
		}
		debugStr += '}\n';

		console.log(debugStr);
		// DEBUG ~ end
		*/
		player.serverId = session.frontendId;
		areaId = player.areaId;
		
		// !IMPORTANT
		// 3/8/17 ME: MUST register chat status to keep the connection open, otherwise, without the following rpc, test button recieves the respond and then connection is disconnected due to client heartbeat timeout. FIND OUT the mechanism, i.e. what does this rpc do!
		pomelo.app.rpc.chat.chatRemote.add(session, session.uid,
			player.name, channelUtil.getAreaChannelName(areaId), null);
		/*
		var map = area.map;
		
		// Reset the player's position if current pos is unreachable
		if(!map.isReachable(player.x, player.y)) {
			var pos = map.getBornPoint();
			player.x = pos.x;
			player.y = pos.y;
		}
		
		var data = {
			entities: area.getAreaInfo(),
			curPlayer: player.getInfo(),
			// check with Zhou YJ, what properties should class map conatin
			map: {
				name: map.name,
				width: map.width,
				height: map.height,
				tileW: map.tileW,
				tileH: map.tileH,
				// 3/7/17: for 1st demo, no collisions, but map has waves on surface, does server care about it? seems no
				weightMap: map.collisions	
				// 3/8/17: for 1st demo, no map info needs to be returned
			}
		};
		*/
				
		// for carSync demo
		/**
		 * 3/9/17 ME: !Potential bug - MAKE SURE Zhou YJ deals with it.
		 *
		 * at client SIDE, if player already in scene, needs to check entities, server automatically reset the player's
		 * position and other status info according to data stored in DB
		 * client side needs to check to make sure re-enter scene has the expected effects shown in browser!
		 */
		var data = {
			entities: area.getAreaInfo(),	// get entities in the area
			curPlayer: player.getInfo()
		}
		
		next(null, data);
		
		/**
		 * 3/9/17 ME: for carSync Demo this is not necessary. 
		 * BUT, do we need to pushMessageToArea about new entities added to area if client side does not periodically send its 
		 * status data to server? - probably yes. Do it right now. Make previously logged in user see a new car when new user enter
		 */
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
		messageService.pushMessageToArea(area, EVENT.USERENTERSCENE, msg, ignoreList);
		
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
	
	area.updateEntity(player);
	
	var ignoreList = {};
	ignoreList[session.uid] = true;
	messageService.pushMessageToArea(area, EVENT.UPDATE, msg, ignoreList);
	
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
