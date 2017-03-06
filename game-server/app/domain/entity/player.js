/**
 * Player Entity
 * According to schema, Player(id, userId, name, x, y, areaId, kindId, kindName)
 */

var pomelo = require('pomelo');
var util = require('util');
var utils = require('../../util/utils');
//var underscore = require('underscore');
//var dataApi = require('../../util/dataApi');
//var consts = require('../../consts/consts');
//var EntityType = consts.EntityType;
var Character = require('./character');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Initialize a new 'Player' with give opts.
 * Player inherits Character
 *
 * @param		{Object}		opts
 * @api 		public
 *
 */
var Player = function(opts) {
	Character.call(this, opts);
	this.id = Number(opts.id);
	//this.type = EntityType.PLAYER;		// not used for now
	this.userId = opts.userId;
	this.name = opts.name;
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;


/**
 * Conver player's state to json and return
 * 
 * 3/6/17 ME: stip() not returning player.userId. 
 * strip() is called in connector.carModelHandler.createPlayer afterLogin, 
 * where it deals with session after player first initiated
 * A: the returned json is used for setting session, since session.bind(uid) 's uid is from user (param) 's id, no need to return uid again
 */
Player.prototype.strip = function() {
	return {
		id: this.id,
		entityId: this.entityId,
		name: this.name,
		x: Math.floor(this.x),
		y: Math.floor(this.y),
		areadId: this.areaId,
		kindId: this.kindId,
		kindName: this.kindName
	}
}
