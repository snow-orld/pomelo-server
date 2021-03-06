//var _poolModule = require('generic-pool');
//var _rPoolModule = require('rethinkdbdash');
var _rPoolModule = require('rethinkdb-pool');
var rethinkdbConfig = require('../../../../shared/config/rethinkdb');

var env = process.env.NODE_ENV || 'development';
if(rethinkdbConfig[env]) {
  rethinkdbConfig = rethinkdbConfig[env];
}

/*
 * Create rethinkdb connection pool, using rethinkdbdash
 *
 * @see https://github.com/neumino/rethinkdbdash
 */
/*
var createRethinkdbPool = function() {
	// connect to specified server and use a maximum of 3000 connections and try to keep 300 connections available at all time
	return _rPoolModule({
		servers: [
			{host: rethinkdbConfig.host, port: rethinkdbConfig.port}
		]
		db: rethinkdbConfig.database,
		buffer: 300,
		max: 3000
	});
};
*/

/*
 * Create rethinkdb connection pool, using rethinkdb-pool
 *
 * @see https://github.com/hden/rethinkdb-pool
 */
var createRethinkdbPool = function() {
	var r = require('rethinkdb');
	return _rPoolModule(r, {
	  host:rethinkdbConfig.host,
	  port:rethinkdbConfig.port,
	  db:rethinkdbConfig.database,
	  authKey:''
	});
};

exports.createRethinkdbPool = createRethinkdbPool;
