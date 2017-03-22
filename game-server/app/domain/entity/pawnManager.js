/**
 * Manager of controlling mapping between entities player and actual characters in area
 *
 * Author:	ME
 * Created on:	3/20/17
 * Modified on:	3/20/217
 *
 */
var logger = require('pomelo-logger').getLogger(__filename);
var consts = require('../../consts/consts');
var ControllerType = consts.ControllerType;
var EntityType = consts.EntityType;

var Manager = function(opts) {
	this.area = opts.area;
	this.controllers = {};	// mapping from playerId to entityId
};

module.exports = Manager;

Manager.prototype.init = function() {
	
};

/**
 * Register to be the controller of specified entity with eid, using controllerType controller (playerCtr or AICtr)
 *
 * 3/20/17: FOR NOW, not a general use case for all entities, only take entityType == AUTODRIVE into account. 
 * Needs to extend!
 *
 * @param {Array}		eids 			entityIds to be registered to be controlled by 
 * @param {Number} 	playerId 	playerId to control the entities
 * @param {String} 	cntrType 	controller type the player use
 * @return {Array} 	[entityIds]	entityIds successfully registered controller for 
 *
 */
Manager.prototype.register = function(eids, playerId, cntrType) {
	if (cntrType !== ControllerType.AI && cntrType !== ControllerType.PLAYER) {
		logger.error(' invalid controller type! ');
		return null;
	}
	
	var result = [];
	for (var i in eids) {
		var eid = eids[i];
		var entity = this.area.getEntity(eid);
		var controllers = this.controllers;
		if (!!entity) {
			// narrowed use case - 3/20/17 ME: TODO - extend this interface for all entities 
			// (reason of narrowing is that, for now, only AUTODRIVE has property 'this.aiManager', 
			// the property datastructure needs updating too)
			if (entity.type == EntityType.AUTODRIVE && entity.aiManager == null) {
				entity.aiManager = playerId;

				if (!controllers[playerId]) {
					controllers[playerId] = {};
				}
				if (!controllers[playerId][cntrType]) {
					controllers[playerId][cntrType] = [];
				}
				
				result.push(eid);
				controllers[playerId][cntrType].push(eid);
			}
		}
	}
	
	logger.warn('pawnManager registered player %j aiManagers for eids %j, pawnManager.controllers = %j', playerId, eids, this.controllers);
	return result;
};

/**
 * Clean up pawnManager and entities' controller after a former controller player leaves
 *
 * CAREFUL! 
 * 3/21/17 : when to remove the entity from area or not if their controller sets to null (player remove, ai remain?)
 *
 * @param {Number}	playerId	playerId that leaves
 * @return {Bool}		true for cleanup success, vice versa
 *
 */
Manager.prototype.unregister = function(playerId) {
	if (!this.controllers[playerId]) {
		logger.warn('player is not controlling any entity!');
		return true;
	}

	for (var cntrType in this.controllers[playerId]) {
		var controller = this.controllers[playerId][cntrType];

		for (var i in controller) {
			var entityId = controller[i];
			var entity = this.area.getEntity(entityId);
			if (!!entity && entity.type == EntityType.AUTODRIVE) {
				entity.aiManager = null;
			}
		}
		
		if (cntrType == ControllerType.PLAYER) {
			this.area.remove(playerId);
		}
		
		delete this.controllers[playerId][cntrType];
	}
	delete this.controllers[playerId];

	logger.warn('pawnManager unregister control of playerId %j, cleaned up pawnManager.controllers is %j', playerId, this.controllers);
	return true;
};
