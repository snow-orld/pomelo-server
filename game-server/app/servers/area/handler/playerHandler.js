var messageService = require('../../../services/msessageService');
//var areaService = require('../../../services/areaService');
var userDao = require('../../../dao/userDao');
//var actionManager = require('../../../domain/action/actionManager');
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var consts = require('../../../consts/consts');
//var dataApi = require('../../../util/dataApi');
//var channelUtil = require('../../../util/channelUtil');
var utils = require('../../../util/utils');

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
	var area = session.area;	// 3/7/18 ME: connector does no set area to session when bind sessions. where does it get set, areaServer - backend session?
	var playerId = session.get('playerId');
	var areaId = session.get('areaId');
	
	userDao.getPlayerAllInfo(playerId, function(err, player) {
		if (err || !player) {
			logger.error('Get player for userDao failed! ' + err.stack);
			next(new Error('fail to get player from database', {
				route: msg.route,
				cdoe: consts.MESSAGE.ERR
			});
			
			return;
		}
		
		// DEBUG ~ begin
		var debugStr = '[DEBUG]enterScene func @ area.playerHandler: got playerAllInfo by playerId. object Player is {'
		for (var p in player) {
			if (typeof player[p] == 'object') {
				debugStr += '{';
				for (var sp in player[p]) {
					debugStr += sp + ':' + player[p][sp] + ',';
				}
				debugStr += '},';
			} else	
				debugStr += p + ':' + player[p] + ',';
		}
		debugStr += '}';
		console.log(debugStr);
		// DEBUG ~ end
			
		/*
		player.serverId = session.frontendId;
		areaId = player.areaId;
		
		//pomelo.app.rpc.chat.chatRemote.add(session, session.uid,
		//	palyer.name, channelUtil.getAreaChannelName(areaId), null);
		
		var map = area.map;
		
		// Reset the player's position if current pos is unreachable
		if(!map.isReachable(player.x, player.y)) {
			var pos = map.getBornPoint();
			player.x = pos.x;
			player.y = pos.y;
		}
		
		var data = {
			entities: area.getAreaInfo({x: player.x, y: player.y}, player.range),
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
			}
		};
		*/

		// for test only
		var data = {
			entities: 'peach',
			curPlayer: player.getInfo(),
			map: 'no map yet'
		}
		
		next(null, data);
		
		/*
		if (!area.addEntity(player)) {
			logger.error('Add player to area failed! areadId : ' + player.areaId);
			next(new Error('fail to add user into area'), {
				route: msg.route;
				code: consts.MESSAGE.ERR
			});
			return;
		}
		*/
	});
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
