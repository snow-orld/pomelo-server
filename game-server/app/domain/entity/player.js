/**
 * Player Entity
 * According to schema, Player(id, userId, name, x, y, z, qx, qy, qz, qw, areaId)
 */

var pomelo = require('pomelo');
var util = require('util');
var utils = require('../../util/utils');
//var underscore = require('underscore');
//var dataApi = require('../../util/dataApi');
var consts = require('../../consts/consts');
var EntityType = consts.EntityType;
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
	this.type = EntityType.PLAYER;
	this.userId = opts.userId;
	this.name = opts.name;
	this.qx = opts.qx;
	this.qy = opts.qy;
	this.qz = opts.qz;
	this.qw = opts.qw;
	
	this.velocity = opts.velocity || [0, 0, 0],
	this.streering = opts.steering || [0, 0, 0, 0]
	
	// player info including car info, which is used to render on clientside.
	// not associated with session. like bag, it is stored in db in a separate table. But unlik bag, lik pos, it changes frequently
	this.car = opts.car;
};

util.inherits(Player, Character);

/**
 * Expose 'Player' constructor.
 */
module.exports = Player;


/**
 * Conver player's BASIC info to json and return
 * used in connector.entryHandler and connector.carModelHandler for dealing with session bind
 * 3/8/17 ME: also used in playerHandler.enterScene player.getInfo to return to clientside;
 * 
 * 3/6/17 ME: stip() not returning player.userId. 
 * strip() is called in connector.carModelHandler.createPlayer afterLogin, 
 * where it deals with session after player first initiated
 * A: the returned json is used for setting session, since session.bind(uid) 's uid is from user (param) 's id, no need to return uid again
 *
 */
Player.prototype.strip = function() {
	return {
		id: this.id,
		entityId: this.entityId,
		name: this.name,
		areadId: this.areaId,
		position: [this.x, this.y, this.z],
		quaternion: [this.qx, this.qy, this.qz, this.qw],
		velocity: this.velocity,
		steering: this.streering,
		type: this.type	// not in DB, only in memory to diffirentiate Entities that appear on the map
	}
}

/**
 * Get the overall information of player, including its car
 *
 * @return 	{Object}
 * @api public
 */
Player.prototype.getInfo = function() {
	var playerData = this.strip();
	playerData.car = this.car;
	
	// to cope with clientside needs (3/8/17 ME: this.type can be used for similar cases)
	playerData.agent = true;
	
	return playerData;
}


