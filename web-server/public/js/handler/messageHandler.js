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
		
		this.pomelo.on('update', function(msg) {
			console.log('update', msg);
		});
		
		// 3/9/17 ME: NOT sure why p2 leaves will trigger twice 'userLeave' on p1's console
		// guess 1: window.pomelo is registered with 'userLeave' twice all-together for p1 and p2 ?
		// BUT the same does not happen for 'update'?
		// NO - game-server log, it is the server that send twice the 'userLeave' message. 
		// SO - check where this 'userLeave' msg is pushed (NOT done yet)
		this.pomelo.on('userLeave', function(msg) {
			console.log('userLeave', msg);
		});
		
		this.pomelo.on('userEnter', function(msg) {
			console.log('userEnter', msg);
		});
	}
	
	return new msgHandler();
	
});
