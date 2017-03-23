// rethinkdb CRUD
var reclient = module.exports;

var r = require('rethinkdb');
var _pool = null;

var NND = {};

/*
 * Init rethinkdb connection pool
 * @param {Object} app The app for the server.
 */
NND.init = function(){
	if(!_pool)
		_pool = require('./dao-pool').createRethinkdbPool();
};

/**
 * Excute rethinkdb query based on passed in sql statement
 * @param {String} sql statement The query rethinkdb need to execute.
 * @param {Object} args The args for the sql.
 * @param {fuction} callback Callback function.
 * 
 */
NND.query = function(sql, args, callback){
	_pool.acquire(function (err, connection) {
		if (!!err) {
			console.error('[queryErr] '+err.stack);
			return;
		}
		
		// parse the sql to reQL
		// 3/23/17: now only insert and retrieve used
		// TODO: if sql contains consecutive spaces, the parse result it not what we want, pay attention to the sql format
		var crudKeywords = sql.split(" ")[0].trim();
		
		switch(crudKeywords) {
			case "insert":
				var object = {};
				var tableName = sql.split(" ")[2];
				var keys = sql.split('(')[1].split(')')[0].split(',').map(function(e) {e = e.trim(); return e});
				
				// input sql must be of rigid format, i.e. delimered by juse ONE space
				if (!tableName || !keys) {
					console.error('[queryErr] invalid query %j. the delimeter must be exactly ONE space.', sql);
					return;
				}
			
				for (var i = 0; i < args.length; i++) {
					object[keys[i]] = args[i];
				}
				
				r.table(tableName).insert(object).run(connection, function(err, res) {
					_pool.release(connection);
					callback.apply(null, [err, res]);
				});
				
				break;
			case "select":
				if (sql.search(/\* from/) < 0) {
					console.error('[queryErr] invalid query %j. can only select * from table.', sql);
				}
				
				if (args.length != 1) {
					console.error('[queryErr] invalid query %j. condition is invalid. the number of condition equation must be 1.', sql);
					return;
				}
				
				var tableName = sql.slice(sql.search(/\* from/) + 7).split(" ")[0];
				var conditionKey = sql.slice(sql.search(/where/)).split(" ")[1];
				var conditionValue = args[0];

				// input sql must be of rigid format, i.e. delimered by juse ONE space
				if (!tableName || !conditionKey || !conditionValue) {
					console.error('[queryErr] invalid query %j. the delimeter must be exactly ONE space.', sql);
					return;
				}
								
				r.table(tableName).filter(r.row(conditionKey).eq(conditionValue)).run(connection, function(err, cursor) {
					_pool.release(connection);
					cursor.toArray(function(cErr, res) {
						if (!!cErr) {
							console.error('[queryErr]select query@rethinkdb cursor converted to array error ', cErr);
						} 
						//console.log('[DEBUG]select query@rethinkdb: select result is ', res)
						callback.apply(null, [err, res]);	
					});
				});
				
				break;
			case "update":
				var tableName = sql.split(" ")[1];
				// @see reQL https://www.rethinkdb.com/docs/guide/javascript/
				break;
			case "delete":
				var tableName = sql.split(" ")[2];
				// @see reQL https://www.rethinkdb.com/docs/guide/javascript/
				break;
			default:
				console.error('[queryErr] invalid sql statement');
				return;
		}
	});
};

/**
 * Close connection pool.
 */
NND.shutdown = function(){
	_pool.destroyAllNow();
};


/**
 * init database
 */
reclient.init = function() {
	if (!!_pool){
		return reclient;
	} else {
		NND.init();
		reclient.insert = NND.query;
		reclient.query = NND.query;
		reclient.update = NND.query;
		//reclient.delete = NND.query;
    return reclient;
	}
};

/**
 * shutdown database
 */
reclient.shutdown = function() {
	NND.shutdown();
};
