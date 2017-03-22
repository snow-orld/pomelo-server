var logger = require('pomelo-logger').getLogger(__filename);
var ControllerType = require('../../../consts/consts').ControllerType;

var handler = module.exports;

/**
 * Player register to be the ai manager of sent AI entities identified by entityId
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
handler.register = function(msg,  session, next) {
	var area = session.area;
	var playerId = session.get('playerId');
	
	// mapping from playerId to the list of AI entities (auto drive car) they manage
	var entityIds = msg.content;
	var registeredEids = area.pawnManager.register(entityIds, playerId, ControllerType.AI);
	
	next(null, {code: 200, registered: registeredEids.length ? registeredEids : null});
};
