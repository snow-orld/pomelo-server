var pomelo = require('./build');
var async = require('async');
var CODE = require('../shared/code');

var WebSocket = require('websocket-client');

var concurrency = 1;
var host = 'localhost';
var port = 3014;

if (process.argv[2]) {
	concurrency = Number(process.argv[2]);
}

console.log('concurrency clients %d', concurrency);

function queryEntry(uid, callback) {

	pomelo.init({host: host, port: port, log: true}, function() {		
		pomelo.request('gate.gateHandler.queryEntry', {uid: uid}, function(data) {
			pomelo.disconnect();
			
			//console.log('gate server resonds %j', data);
			if (data.code === CODE.FA_NO_SERVER_AVAILABLE) {
				alert('Gate server errror: server not available!');
				return;
			}
			
			callback(data.host, data.port);
			
		});
	});
}

function main() {
	/*	
	for (var i = 1; i <= concurrency; i++) {
		queryEntry(i, function(host, port) {
			console.log('get host %s, port %d', host, port)
		});
	}
	*/
	var count = 0;
	async.whilst(
		function() { return count < 2; },
		function(callback) {
			count++;
			console.log('Client %d', count);
			queryEntry(count, function(host, port) {
				//console.log('get host %s, port %d', host, port);
			});
		},
		function(err) {
			console.log('DONE');
		}
	);
}

main();
