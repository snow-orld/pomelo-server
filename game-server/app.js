var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');
var ChatService = require('./app/services/chatService');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'demo');

// gloable configuration
app.configure('production|development', function() {
	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
});

// configure connector server
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
      heartbeat : 3,
      //useDict : true,
      //useProtobuf : true,
      handshake : function(msg, cb) {
      	cb(null, {});
      }
    });
});

// configure gate server
app.configure('production|development', 'gate', function() {
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});

// configure auth server
app.configure('production|development', 'auth', function() {
	// load session settings
	app.set('session', require('../shared/config/session.json'));
});

// configure chat server
app.configure('production|development', 'chat', function() {
	app.set('chatService', new ChatService(app));
});

// configure database
app.configure('production|development', 'auth|connector|area', function() {
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	app.use(sync, {sync: {path:__dirname + '/app/dao/mapping/', dbclient: dbclient}});
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
