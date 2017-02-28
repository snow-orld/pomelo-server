var Code = require('../../../../../shared/code');
var dispatcher = require('../../../util/dispatcher');
 
module.exports = function(app) {
	return new Handler(app);
}

var Handler = function(app) {
	this.app = app;
}

/**
 * Gate handler that dispatch user to connectors.
 * 
 * @param {Object} msg message from client
 * @param {Object} session 
 * @param {Function} next next step callback
 *
 */
Handler.prototype.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	if (!uid) {
		// code 500
		next(null, {code: Code.FAIL});
		return;
	}
	
	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		next(null, {code: Code.GATE.FA_NO_SERVER_AVAILABLE});
		return;
	}
	
	var res = dispatcher.dispatch(uid, connectors);
	next(null, {code: Code.OK, host: res.host, port: res.clientPort});
	
	/*
	// For game-server/app/util/gateHandler.test.js test only
	var connectors = [];
	var connector = {
		"id": "connector-server-1", 
    "host": "127.0.0.1", 
    "port": 3150, 
    "clientHost": "127.0.0.1", 
    "clientPort": 3010, 
    "frontend": true
   };
   connectors.push(connector);
   if (!connectors || connectors.length === 0) {
		next(null, {code: Code.GATE.FA_NO_SERVER_AVAILABLE});
		return;
	}
	
	var res = dispatcher.dispatch(uid, connectors);
	next(null, {code: Code.OK, host: res.host, port: res.clientPort});
	*/
}
