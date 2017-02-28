var pomelo = require('pomelo');
var gateHandler = require('../servers/gate/handler/gateHandler');

var gateHandler = new gateHandler();
var msg = {uid: '1'};
var session = {};

gateHandler.queryEntry(msg, session, function(err, data) {
	console.log(err, data);
});
