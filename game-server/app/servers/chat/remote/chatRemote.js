module.exports = function(app) {
	return new ChatRemote(app, app.get('chatService'));
};

var ChatRemote = function(app, chatService) {
	this.app = app;
	this.chatService = chatService;
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} playerName player's name
 * @param {String} name channel name
 * @param {Function} cb callback function 
 *
 */
ChatRemote.prototype.add = function(uid, playerName, channelName, cb) {
	var code = this.chatService.add(uid, playerName, channelName);
	cb(null, code);
};


/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid user id
 * @param	 {Function} cb callback function
 *
 */
ChatRemote.prototype.kick = function(uid, cb)  {
	this.chatService.kick(uid);
	cb();
}
