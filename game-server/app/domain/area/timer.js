var messageService = require('../../services/messageService');
var EntiType = require('../../consts/consts').EntityType;
var logger = require('pomelo-logger').getLogger(__filename);

var Timer = function(opts) {
	this.area = opts.area;
	this.interval = opts.interval || 100;
};

module.exports = Timer;

Timer.prototype.run = function() {
	this.interval = setInterval(this.tick.bind(this), this.interval);
};

Timer.prototype.close = function() {
	clearInterval(this.interval);
};

Timer.prototype.tick = function() {
	var area = this.area;
	
	// update every objects that have update methods
};

/**
 * Update object for aoi
 * @param obj {Object} Given object need to update.
 * @param oldPos {Object} Old position.
 * @param newPos {Object} New position.
 * @return {Boolean} If the update success.
 */
Timer.prototype.updateObject = function(obj, oldPos, newPos) {
	return this.area.aoi.updateObject(obj, oldPos, newPos);
};

/**
 * Get all the watchers in aoi for given position.
 * @param pos {Object} Given position.
 * @param types {Array} The watchers types.
 * @param ignoreList {Array} The ignore watchers' list.
 * @return {Array} The qualified watchers id list. [{uid, sid}, ] 
 */
Timer.prototype.getWatcherUids = function(pos, types, ignoreList) {
	var area = this.area;
	
	var watchers = area.aoi.getWatchers(pos, types);
	var result = [];
	if (!!watchers && !!watchers[EntityType.PLAYER]) {
		var pWatchers = watchers[EntityType.PLAYER];
		for (var entityId in pWatchers) {
			var player = area.getEntity(entityId);
			if (!!player && !! player.userId && (!ignoreList || !ignoreList[player.userId])) {
				result.push({uid: player.userId, sid: player.serverId});
			}
		}
	}
	
	return result;
};	

/**
 * Get watchers by given position and types, without ignore list.
 * @param pos {Object} Given position.
 * @param types {Array} Given watcher types.
 * @return {Array} Watchers find by given parameters.
 */
Timer.prototype.getWatchers = function(pos, types) {
	return this.area.aoi.getWatchers(pos, types);
};

/**
 * Update given watcher.
 * @param watcher {Object} The watcher need to update.
 * @param oldPos {Object} The old position of the watcher.
 * @param newPos {Ojbect} The new position of the watcher.
 * @param oldRange {Number} The old range of the watcher.
 * @param newRange {Number} The new range of the watcher.
 * @return Boolean If the update is success.
 */
Timer.prototype.updateWatcher = function(watcher, oldPos, newPos, oldRange, newRange) {
	return this.area.aoi.updateWatcher(watcher, oldPos, newPos, oldRange, newRange);
};
