var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');
var ChatService = require('./app/services/chatService');
var playerFilter = require('./app/servers/area/filter/playerFilter');
var scene = require('./app/domain/area/scene');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'demo');

// gloable configuration
app.configure('production|development', function() {
	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
	app.loadConfig('rethinkdb', app.getBase() + '/../shared/config/rethinkdb.json');
/*	
	// proxy configures
	app.set('proxyConfig', {
		cacheMsg: true,
		interval: 30,
		lazyConnection: true		// 3/8/17 ME: does this have anything to do with the chat handler rpc timeout error? - NO
	});
	
	// enable rpc logs
	app.rpcFilter(pomelo.rpcFilters.rpcLog());	// 3/8/17 ME: try to log error when chat handler cannot return res - NO
	
	// remote configures
	app.set('remoteConfig', {
		cacheMsg: true,
		interval: 30
	});
*/
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

// configure area server
app.configure('production|development', 'area', function() {
	app.filter(pomelo.filters.serial());
	app.before(playerFilter());
	
	// Load scene server - for now, server does not need to run a map 
	//var server = app.curServer;
	scene.init({id: '1', type: 'none'});
	app.areaManager = scene;
});

// configure database
app.configure('production|development', 'auth|connector|area', function() {
	//var dbclient = require('./app/dao/mysql/mysql').init(app);
	var dbclient = require('./app/dao/rethinkdb/rethinkdb').init(app);
	app.set('dbclient', dbclient);
	app.use(sync, {sync: {path:__dirname + '/app/dao/mapping/', dbclient: dbclient}});
});

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
