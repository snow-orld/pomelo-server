var Code = require('../../../shared/code');
var uitls = require('../util/utils');
var dispatcher = require('../util/dispatcher');
var Event = require('../consts/consts').EVENT;

var ChatService = function(app) {
	this.app = app;
	this.nameMap = {};
	this.uidMap = {};
	this.channelMap = {};
};

module.exports = ChatService;

/**
 * Add player into the channel
 *
 * @param {String} uid         user id
 * @param {String} playerName  player's role name
 * @param {String} channelName channel name
 * @return {Number} see code.js
 *
 */
ChatService.prototype.add = function(uid, playerName, channelName) {
	var sid = getSidByUid(uid, this.app);
	if (!sid) {
		return Code.CHAT_FA_UNKNOWN_CONECTOR;
	}

	if (checkDuplicate(this, uid, channelName)) {
		return Code.OK;
	}
		
	var channel = this.app.get('channelService').getChannel(channelName, true);
	if (!channel) {
		return Code.CHAT_FA_CHANNEL_CREATE;
	}
	

	channel.add(uid, sid);
	addRecord(this, uid, playerName, sid, channelName);
	
	return Code.OK;
}

/**
 * Get the connector server id associated with the uid
 */
var getSidByUid = function(uid, app) {
	var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
	if (connector) {
		return connector.id;
	}
	return null;
}

/**
 * Check whether the user has already been in the channel
 */
var checkDuplicate = function(service, uid, channelName) {
	return !!service.channelMap[uid] && !!service.channelMap[uid][channelName];
};

/**
 * Add records for the specified user
 */
var addRecord = function(service, uid, name, sid, channelName) {
	var record = {uid: uid, name: name, sid: sid};
	service.uidMap[uid] = record;
	service.nameMap[name] = record;
	var item = service.channelMap[uid];
	if (!item) {
		item = service.channelMap[uid] = {};
	}
	item[channelName] = 1;
};

/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid user id
 *
 */
ChatService.prototype.kick = function(uid) {
	var channelNames = this.channelMap[uid];
	var record = this.uidMap[uid];
	
	if (channelNames && record) {
		// remove user from channel
		var channel;
		for (var channelName in channelNames) {
			channel = this.app.get('channelService').getChannel(channelName);
			if (channel) {
				channel.leave(uid, record.sid);
			}
		}
	}
	
	clearRecords(this, uid);
};

/**
 * Clear all records of the give uid
 */
var clearRecords = function(service, uid) {
	delete service.channelMap[uid];
	
	var record = service.uidMap[uid];
	if (!record) {
		return;
	}
	
	delete service.uidMap[uid];
	delete service.nameMap[record.name];
};

// <-- functions used in chatRemote

// functions used in chatHandler -->

/**
 * Push message by the specified channel
 *
 * @param  {String}   channelName channel name
 * @param  {Object}   msg         message json object
 * @param  {Function} cb          callback function
 *
 */
ChatService.prototype.pushByChannel = function(channelName, msg, cb) {
	var channel = this.app.get('channelService').getChannel(channelName);
	if (!channel) {
		cb(new Error('channel ' + channelName + ' does not exist'));
		return;
	}
	
	channel.pushMessage(Event.CHAT, msg, cb);
};
