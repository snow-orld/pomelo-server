var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);
var Persistent = require('../persistent'); // data sync module 3/8/17 ME: it can emit 'save' event via calling this.save()

/**
 * Initiliaze a new 'Car' with give opts, its property maps to definition of config/setup.sql
 * Car inherits Persistent
 *
 * @param 	{Object}	opts
 * @api public
 *
 */
var Car = function(opts) {
	this.mass = opts.mass || 150;
	this.width = opts.width || 3;
	this.height = opts.height || 1,
	this.length = opts.length || 6,
	this.wheelRadius = opts.wheelRadius || 1,
	this.wheelHeight = opts.wheelHeight || -0.5,
	this.wheelDepth = opts.wheelDepth || 0.5,
	
	this.velocity = opts.velocity || [0, 0, 0],
	this.streerint = opts.steering || [0, 0, 0, 0]
}

util.inherits(Car, Persistent);

module.exports = Car;
