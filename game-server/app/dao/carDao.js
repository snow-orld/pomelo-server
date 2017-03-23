var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');
var Car = require('../domain/account/car');

var carDao = module.exports;

/**
 * Create Car - called when player is created in carModelHandler.createPlayer
 *
 * !IMPORTANT 3/8/17 this function has NOT been tested yet!
 *
 * @param		{Number}		playerId		Player Id
 * @param		{function}	cb					callback function
 *
 */
carDao.createCar = function(playerId, cb) {
	var sql = 'insert into Car (playerId, mass, width, height, length, wheelRadius, wheelHeight, wheelDepth) values (?,?,?,?,?,?,?,?)';
	var args = [playerId, 150, 3, 1, 6, 1, -0.5, 0.5];
	
	console.log('[DEBUG] createCar @ carDao: playerId = %j', playerId);
	
	this.getCarByPlayerId(playerId, function(err, res) {
		if (!!err && !res) {
			// if car with the playerId does not exist in db yet, create new
			pomelo.app.get('dbclient').insert(sql, args, function(err, res) {
				if (err) {
					logger.error('create car for carDao failed! ' + err.stack);
					utils.invokeCallback(cb, err, null);
				} else {
					// 3/8/17 ME: it seems must create a new Car object to pass into callback
					var car = new Car({id: res.generated_keys[0]});
					utils.invokeCallback(cb, null, car);
				}
			});
		} else {
			utils.invokeCallback(cb, new Error(' car with the same playerId already exists '), null)
		}
	});
			
};

/**
 * Find car by playerId
 *
 * @param		{Number}		playerId 		Player Id
 * @param		{function}	cb					callback function
 *
 */
carDao.getCarByPlayerId = function(playerId, cb) {
	var sql = 'select * from Car where playerId = ?';
	var args = [playerId];
	
	pomelo.app.get('dbclient').query(sql, args, function(err, res) {
		if (err) {
			logger.error('get car by playerId for carDao failed! ' + err.stack);
			utils.invokeCallback(cb, err, null);
		} else {
			if (res && res.length === 1) {
				var result = res[0];
				// 3/8/17 ME: what if just return res[0]? -- seems OK, since they are both a JSON with same fields.
				//var car = new Car({id: result.id, mass: result.mass, width: result.width, height: result.height, length: result.length, wheelRadius: result.wheelRadius, wheelHeight: result.wheelHeight, wheelDepth: result.wheelDepth});
				//console.log('[DEBUG]getCarByPlayerId @ carDao: find result is ' + JSON.stringify(result));
				cb(null, result);
			} else {
				logger.warn('car does not exist!');
				utils.invokeCallback(cb, new Error(' car does not exist ', null), null);
			}
		}
	});
};
