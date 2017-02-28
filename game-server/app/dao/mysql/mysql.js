// mysql CRUD
var sqlclient = module.exports;

var _pool;

var NND = {};

/**
 * Init sql connection pool
 * @param		{Object}	app	The app for the server
 *
 */
NND.init = function(app) {
	_pool = require('./dao-pool').createMysqlPool(app);
};

/**
 * Execute sql statement
 * @param		{String}		sql	statement		The sql to be excuted
 * @param		{Object}		args						Args for the sql statement
 * @param 	{function}	cb							Callback function
 *
 */
NND.query = function(sql, args, cb) {
	_pool.acquire(function(err, client) {
		if (!!err) {
			console.error('[sqlquerErr] ' + err.stack);
			return;
		}
		
		client.query(sql, args, function(err, res) {
			_pool.release(client);
			cb(err, res);
		});
	});
};

/**
 * Close connection pool
 */
NND.shutdown = function() {
	_pool.destroyAllNow();
}

/**
 * Init database
 */
sqlclient.init = function(app) {
	if (!!_pool) {
		return sqlclient;
	} else {
		NND.init(app);
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		return sqlclient;
	}
};
