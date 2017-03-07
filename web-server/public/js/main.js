requirejs.config({
	//By default load any module IDs from js/lib
	baseUrl: '../../js',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		jquery: 'lib/libscripts/jquery-3.1.1.min',
		config: 'config/config',
		switchManager: 'ui/switchManager',
		messageHandler: 'handler/messageHandler',
		clientManager: 'ui/clientManager',
	}
});

requirejs(['clientManager'], function(clientManager) {
	var clientManager = new clientManager();
	clientManager.init();

});
