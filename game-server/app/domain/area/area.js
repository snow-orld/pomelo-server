var pomelo = require('pomelo');
var EntityType = require('../../consts/consts').EntityType;
var utils = require('../../util/utils');
var channelUtil = require('../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var Timer = require('./timer');
var aoiManager = require('pomelo-aoi');
var AutoDrive = require('../entity/autoDrive');
var PawnManager = require('../entity/pawnManager');

/**
 * Init areas
 *
 * 3/8/17 ME: for carSync demo, area only needs to keep track of entities in the scene 
 * and update them when recieved position change events (5Hz from client)
 *
 * @param	{Object} opts
 * @api public
 */
var Instance = function(opts) {
	this.areaId = opts.id;
	this.type = opts.type;
	
	// Mapping from player to entity
	this.players = {};
	this.users = {};
	this.entities = {};		// 3/8/17 ME: for now, player is the only type of entity in scene
	this.channel = null;
		
	this.playerNum = 0;
	
	// broadcast interval
	this.bcInterval = null;

	// 3/19/17: mapping from AI entityId (auto drive car) to playerId
	this.aiManagers = {}; // get updated in 'area.aiHandler.register'
	this.AICARNUM = 4;
	// 3/20/17: a new abstract level to bind playerController and actual character in area
	this.pawnManager = new PawnManager({ area: this });

	// Init AOI
	this.aoi = aoiManager.getService(opts);
	
	this.timer = new Timer({
		area: this,
		interval: 100
	});
	
	this.start();
};

module.exports = Instance;

/**
 * @api public
 */
Instance.prototype.start = function() {
	// aoiEventManger.addEvent
	
	// init auto drive AI cars data, default their manager mapping this.ais[e.id] = null;
	this.initAIs();
	
	// init pawn manager, manage the controlling access between player and characters in area
	this.pawnManager.init();
	
	// start timer
};

Instance.prototype.close = function() {
	// close timer
};

/**
 * Create or return the channel associated with this area server
 */
Instance.prototype.getChannel = function() {
	if (!this.channel) {
		var channelName = channelUtil.getAreaChannelName(this.areaId);
		this.channel = pomelo.app.get('channelService').getChannel(channelName, true);
	}
	return this.channel;
};

/**
 * Add entity to area
 *
 * @param {Object} e Entity to add to the area
 */
Instance.prototype.addEntity = function(e) {
	var entities = this.entities;
	var players = this.players;
	var users = this.users;
	
	if (!e || !e.entityId) {
		return false;
	}
	
	if (!!players[e.id]) {
		logger.error('add player twice! player : %j', e);
		return false;
	}
	
	// Set aera and areaId
	e.area = this;
	
	entities[e.entityId] = e;
	//eventManager.addEvent(e);
	
	if (e.type === EntityType.PLAYER) {
		//this.getChannel().add(e.userId, e.serverId);	//3/19/17: Move to playerHandler.enterScene()
	
		players[e.id] = e.entityId;	// playerId -> entityId
		users[e.userId] = e.id;			// userid -> playerId
		this.playerNum++;
	} 
			
	return true;
};

/**
 * Get the player object by playerId
 * used in area.playerFilter
 *
 * @param {Number} playerId
 */
Instance.prototype.getPlayer = function(playerId) {
	var entityId = this.players[playerId];
	
	if (!!entityId) {
		return this.entities[entityId];
	}
	
	return null;
};

/**
 * Get area entities in the whole area - 3/8/17 ME: LOP uses aoi to get the info as a optimization
 */
Instance.prototype.getAreaInfo = function() {
	var result = [];
	for (var eid in this.entities) {
		if (this.entities[eid].type == EntityType.PLAYER) {
			result.push(this.entities[eid].getInfo());
		}
		if (this.entities[eid].type == EntityType.AUTODRIVE) {
			result.push(this.entities[eid].getInfo());
		}
	}
	
	return result;
};

/**
 * Update entity whenever the position of entity changes
 * Called when client send msg to area.playerHandler.update
 *
 * Author: ME
 * Created ON: 3/8/17
 *
 * @param {Object} e Entity to update
 */
Instance.prototype.updateEntity = function(e) {
	var entities = this.entities;

	if (!e || !e.entityId) {
		return false;
	}
	
	if (!entities[e.entityId]) {
		logger.error('update non-existing entity! entity : %j', e);
		return false;
	}
	
	// !IMPORTANT - 3/9/17 ME:
	// NOT OK! entity.hasOwnProperty of area, which includes entities, this creates a circulating asssignment!
	//entities[e.entityId] = e;
	
	// 3/9/17 ME: update an entity in area, has to be removing first and adding! Think of if there are other ways.
	if (!this.removeEntity(e.entityId)) {
		logger.error(' updating entity removing Entity failed! areaId ' + this.areaId);	
	}
	if (!this.addEntity(e)) {
		logger.error(' updating entity adding Entity failed! areaId ' + this.areaId);
	}
	
	
};

/**
 * Remove Entity from area
 *
 * @param {Number} entityId The entityId to remove
 * @return {boolean} remove result
 *
 */
Instance.prototype.removeEntity = function(entityId) {
	var entities = this.entities;
	var players = this.players;
	var users = this.users;
	
	var e = entities[entityId];
	if (!e) return true;
	
	// If the entity is a player, remove it
	if (e.type === EntityType.PLAYER) {
		//this.getChannel().leave(e.userId, e.serverId); //3/19/17: move this to removePlayer()
		
		delete players[e.id];
		delete users[e.userId];
		
		this.playerNum--;
	}
	
	delete entities[entityId];
	return true;
};

/**
 * Get uids in the area excluding uids specified in ignoreList
 * Called in MessageService.pushMessageToArea to get the uids to send to
 *
 * Author: ME
 * Created ON: 3/8/17
 *
 * @param {Object} ignoreList  {uid: true, ...} uid will not be returned in the result
 * @return {Array} uids 	uids that are in the area but not in the ignoreList
 *
 */
Instance.prototype.getAllPlayerUids = function(ignoreList) {
	var uids = [];
	
	for (var eid in this.entities) {
		var entity = this.entities[eid];
		if (entity.type == EntityType.PLAYER) {
			if (!ignoreList || !ignoreList[entity.userId]) {
				//console.log('[DEBUG]getAllPlayerUids@area: get uids with ignorelist. uids add {uid:' + entity.userId + ',sid:' + entity.serverId + '}');
				uids.push({uid: entity.userId, sid: entity.serverId});
			}
		}
	}
	
	return uids;
};

/**
 * remove Player
 * called in playerRemote.playerLeave, which is called when onUserLeave triggered by session close
 *
 * @param {Number} playerId 
 */
Instance.prototype.removePlayer = function(playerId) {
	var entityId = this.players[playerId];
	//logger.warn('removePlayer @ area: entityId of playerId %j = %j', playerId, entityId);
	if(!!entityId) {
		this.removeEntity(entityId);
		
		this.getChannel().leave(this.entities[entityId].userId, this.entities[entityId].serverId);	// 3/9/17 this will shut down the client connection ? regardless globalChannel still has this entry? - The connection keeps alive after coding the enteryHandler.onUserLeave, playerRemote.playerLeave funcions
	}
	
	
};

/**
 * get entity by entityId from area
 * called in timer.js getWatcherUids, who returns arrays of {uid, sid}
 */
Instance.prototype.getEntity = function(entityId) {
	var entity = this.entities[entityId];

	return entity ? entity : null;
};

/**
 * Init AI (auto drive car for now 3/19/17) cars' data in the scene
 *
 * Author: ME
 * Created on:	3/19/17
 * Modified on:	3/19/17
 *
 */
Instance.prototype.initAIs = function() {
	for (var i = 0; i < this.AICARNUM; i++) {
		var autoDrive = new AutoDrive();
		if (!this.addEntity(autoDrive)) {
			logger.error(' init auto Drive for AIs failed ');
		}
	}
};

/**
 * get all AI (autoDrive) entitiIds without an aiManager yet
 *
 * @return {Object}	List of autoDrive eids whose aiManager is null
 *
 * Author: ME
 * Created on:	3/19/17
 * Modified on:	3/19/17
 *
 */
Instance.prototype.getAIs = function() {
	var eids = [];
	
	for (var eid in this.entities) {
		var entity = this.entities[eid];
		if (entity.type == EntityType.AUTODRIVE && entity.aiManager == null) {
			eids.push(eid);
		}
	}
	
	return eids;
};

/**
 * add player to area channel
 * called in playerHandler.enterScene (original lop add player to channel in addEntity when e.type === PLAYER)
 *
 * @param	{Object} player
 *
 * Author: ME
 * Created on:	3/19/17
 *
 */
Instance.prototype.addPlayerToChannel = function(player) {
	this.getChannel().add(player.userId, player.serverId);
};
