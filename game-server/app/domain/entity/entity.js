/**
 * Entity Base Object
 *
 * 3/5/17 ME: FOR NOW, players === entity; 
 * According to schema, Player(id, userId, name, x, y, areaId, kindId, kindName)
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var id = 1;

/**
 * Initialize a new 'Entity' with give opts.
 * Entity inherits EventEmitter
 *
 * @param		{Object}		opts
 * @api public
 *
 */
var Entity = function(opts) {
	EventEmitter.call(this);
	this.entityId = id++;
	this.kindId = Number(opts.kindId);
	this.kindName = opts.kindName;
	this.x = opts.x;
	this.y = opts.y;
	this.z = opts.z;
	this.type = opts.type;
	
	// addEntity called when area server gets initiated
	this.areaId = Number(opts.areaId || 1);
	this.area = opts.area;	// 3/9/17 ME: why entity has to store the area. this is a sucpectalbe cause for responding getPlayerAllInfo. already delete player['area'] before userDao.getPlayerAllInfo returns player
}

util.inherits(Entity, EventEmitter);

/**
 * Expose 'Entity' constructor.
 */
module.exports = Entity;

/**
 * Get entityId
 *
 * @return		{number}
 * @api public
 *
 */
Entity.prototype.getEntityId = function() {
	return this.entityId;
}

/**
 * Get state - Get entity position 3/5/17 ME: LOP calls it getState, !IMPORTANT changes it to getPosition
 *
 * @return 		{Object}
 * @api public
 *
 */
Entity.prototype.getPosition = function() {
	return {x: this.x, y: this.y};
}

/**
 * Set position of this entityId
 *
 * @param		{Number}		x
 * @param		{Number}		y
 * @api public
 *
 */
Entity.prototype.setPosition = function(x, y) {
	this.x = x;
	this.y = y;
}
