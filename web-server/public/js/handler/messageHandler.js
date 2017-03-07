define(function() {

	var msgHandler = function() {
		this.pomelo = window.pomelo;
	}
	
	/**
	 * Initiate message handler
	 */
	msgHandler.prototype.init = function() {
		this.pomelo.on('onMsg', function(msg) {
			console.log('onMsg', msg);
		});
	}
	
	return new msgHandler();
	
});
