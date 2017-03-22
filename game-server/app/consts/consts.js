module.exports = {
	MESSAGE: {
		RES: 200,
		ERR: 500,
		PUSH: 600		// 3/5/17 ME: what is the status code 'PUSH' used for in message result?
	},
	
	EntityType: {
		PLAYER:	'player',
		AUTODRIVE: 'AI'
	},
	
	// 3/20/17: most openlly, every entity can be controlled by either player or AI (UE4), introducing pawnManager
	// used in pawnManager.register(eids, playerId, controllerType)
	ControllerType: {
		PLAYER: 'playerController',
		AI: 'AIController'
	},
	
	// 3/5/17 ME: not sure how BornPlace.width/height relates to client view 
	// 3/5/17 A: widht and height is the random number range added to x, y
	BornPlace: {
		x: 50,
		y: 0,
		z: -50,
		width: 100,
		height: 0,
		length: 100
	},
	
	PLAYER: {
		initAreaId: 1
	},
	
	EVENT: {
		CHAT: 'onMsg',
		UPDATE: 'update',
		USERENTERSCENE: 'userEnter',
		USERLEAVESCENE: 'userLeave'
	},
	
	BROADCAST: {
		INTERVAL: 200
	}	

}
