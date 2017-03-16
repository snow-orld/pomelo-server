var pomelo = require('pomelo-client');
var async = require('async');
var config = require('./config');
var CODE = require('../shared/code');

var concurrency = 1;

if (process.argv[2]) {
	concurrency = Number(process.argv[2]);
}

console.log('concurrency clients %d', concurrency);

function queryEntry(uid, callback) {
	console.log('queryEntry running')
	pomelo.init({host: config.HOST, port: config.PORT, log: true}, function() {
		
		console.log('pomelo inited');
		
		pomelo.request('gate.gateHandler.queryEntry', {uid: uid}, function(data) {
			pomelo.disconnect();
			
			console.log('gate server resonds %j', data);
			if (data.code === CODE.FA_NO_SERVER_AVAILABLE) {
				alert('Gate server errror: server not available!');
				return;
			}
			
			callback(data.host, data.port);
			
		});
	});
}

function main() {
		
	for (var i = 1; i <= concurrency; i++) {
		queryEntry(i, function(host, port) {
			console.log('get host %s, port %d', host, port)
		});
	}
}

main();
