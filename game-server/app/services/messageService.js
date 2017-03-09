var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var EntityType = require('../consts/consts').EntityType;

var exp = module.exports;

exp.pushMessageByUids = function(uids, route, msg) {
	pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, errHandler);
}

exp.pushMessageToPlayer = function(uid, route, msg) {
	exp.pushMessageByUids([uid], route, msg);
}

exp.pushMessageByAOI = function(area, msg, pos, ignoreList) {
	var uids = area.timer.getWatcherUids(pos, [EntityType.PLAYER], ignoreList);
	
	if (uids.length > 0) {
		exp.pushMessageByUids(uids, msg.route, msg);
	}
}

function errHandler(err, fails) {
	if (!!err) {
		logger.error('Push Message error! %j', err.stack);
	}
}

/**
 * push message to the whole area with ignoreList options
 * 
 * Created on : 3/8/17
 * Created by : X.M.
 * Modified on: 3/8/17
 *
 * @param {Object}	area
 * @param {String}  route 	event type
 * @param {msg}			msg
 * @param {ignoreList}	{uid: true, }		uid will not be notified
 */
exp.pushMessageToArea = function(area, route, msg, ignoreList) {
	var uids = area.getAllPlayerUids(ignoreList);		// type is Array[{uid, sid}], sid is the connector.id
	var entities = area.entities;
	
	if (uids.length > 0) {
		pomelo.app.get('channelService').pushMessageByUids(route, msg, uids);
	}
};
