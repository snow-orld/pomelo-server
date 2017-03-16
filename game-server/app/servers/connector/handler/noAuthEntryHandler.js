var Code = require('../../../../../shared/code');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;

  if (!this.app) {
  	logger.error(app);
  }
};

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {

	if (msg.hasOwnProperty(uid)) {
		next(null, {code: 500, error: 'msg must contain property "uid"!'});
		return;
	}
	
	var self = this;
	var uid = msg.uid;
	
	async.waterfall([
		
		function(cb) {
			self.app.get('sessionService').kick(uid, cb);
		},
		
		function(cb) {
			session.bind(uid, cb);
		},
		
		function(cb) {
			session.set('test', 'test');
			session.pushAll(cb);
		}
	
	], function(err) {
		
		if (err) {
			logger.error('bind session error %j', err);
			next(err, {code: Code.FAIL});
			return;
		}
		
		next(null, {code: 200});

	});
};
