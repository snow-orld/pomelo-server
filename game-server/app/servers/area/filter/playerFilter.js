var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

module.exports = function() {
	return new Filter();
};

var Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next) {
	var area = pomelo.app.areaManager.getArea(session.get('instanceId'));	// 3/8/17 ME: instanceId ?
	session.area = area;

	var player = area.getPlayer(session.get('playerId'));	
	if (!player) {
		var route = msg.__route__;
		
		if (route.search(/^area\.resourceHandler/i) == 0 || route.search(/^area\.pawnHandler/i) == 0|| route.search(/enterScene$/i) >= 0 || route.search(/enterGame$/i) >= 0) {
			next();
			return;
		} else {
			next(new Error('No player exists!'));
			return;
		}
	}
	
	if (player.died) {	// 3/8/17 ME: player constructor does not initiate this.died
		next(new Error("You can't move a dead player!!!"));
		return;
	}
	
	next();
};
