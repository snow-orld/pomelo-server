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
	
	// 7 attributes including pos, rotation, scale, etc.
	// not associated with session. like bag, it is stored in db in a separate table. But unlik bag, lik pos, it changes frequently
	this.status = opts.status;	
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;


/**
 * Conver player's BASIC info to json and return
 * used in connector.entryHandler and connector.carModelHandler for dealing with session bind
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

/**
 * Set player's status (position, rotation, scale, velocity, etc.)
 * Used in userDao.getPlayerAllInfo, set status of player to reply to playerHandler.enterScene
 */
Player.prototype.setStaus = function(status) {
	for (var p in status) {
		this.status[p] = status[p];
	}
}

/**
 * Get the overall information of player, including its status
 *
 * @return 	{Object}
 * @api public
 */
Player.prototype.getInfo = function() {
	var playerData = this.strip();
	playerData.status = this.status;
	
	return playerData;
}


