var Code = require('../../../../../shared/code');
var channelUtil =require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');
var pomelo = require('pomelo');

module.exports = function(app) {
	return new ChannelHandler(app, app.get('chatService'));
};

var ChannelHandler = function(app, chatService) {
	this.app = app;
	this.chatService = chatService;
};

function setContent(str) {
	str = str.replace(/<\/?[^>]*>/g,'');
	str = str.replace(/[ | ]*\n/g,'\n');
	return str.replace(/\n[\s| | ]*\r/g,'\n');
}

function getChannelName(msg) {
	return channelUtil.getGlobalChannelName();
};

ChannelHandler.prototype.send = function(msg, session, next) {

	var playerId = session.get('playerId');
	var uid = session.uid;
	channelName = getChannelName();
	
	var ignoreList = {};
	ignoreList[uid] = true;

	this.chatService.pushByChannel(channelName, msg, ignoreList, function(err, res) {
		if (err) {
			logger.error(err.stack);
			code = Code.FAIL;
		} else if (res) {
			code = res;
		} else {
			code = Code.OK;
		}
		
		console.log('[DEBUG]send @ chatHandler: send result code is ' + code);
		//next(null, {code: code});
		next(null, null);
	});
}
