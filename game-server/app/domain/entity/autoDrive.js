/**
 * autoDrive Entity
 * Share a similar schema of Player, Player(id, userId, name, x, y, z, qx, qy, qz, qw, areaId, kindId, kindName)
 */

var util = require('util');
var logger = require('pomelo-logger').getLogger(__filename);

var utils = require('../../util/utils');
var consts = require('../../consts/consts');
var EntityType = consts.EntityType;
var born = consts.BornPlace;
var Character = require('./character');
var Car = require('../account/car');

/**
 * Initialize a new 'autoDrive' AI with given opts and randomly generated info.
 * autoDrive inherits Character
 *
 * @api 		public
 *
 */
var autoDrive = function() {
	var opts = {};
	Character.call(this, opts);
	
	this.type = EntityType.AUTODRIVE;
	
	this.x = born.x + Math.floor(Math.random()*born.width);
	this.y = born.y + Math.floor(Math.random()*born.height);
	this.z = born.z + Math.floor(Math.random()*born.length);
	
	this.quaternion = [0, 0, 0, 1];
	
	this.car = new Car(opts);
	
	// ai is managed by distributed clients
	this.aiManager = null;
	
};

util.inherits(autoDrive, Character);

/**
 * Expose 'autoDrive' constructor.
 */
module.exports = autoDrive;

/**
 * Get the overall information of autoDrive, including its car
 *
 */
autoDrive.prototype.getInfo = function() {
	return {
		entityId: this.entityId,
		//areadId: this.areaId,
		//type: this.type,
		aiManager: this.aiManager,
		
		position: [this.x, this.y, this.z],
		quaternion: this.quaternion,
		velocity: this.velocity,
		steering: this.steering,
		car: this.car
	}
};
