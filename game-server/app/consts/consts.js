module.exports = {
	MESSAGE: {
		RES: 200,
		ERR: 500,
		PUSH: 600		// 3/5/17 ME: what is the status code 'PUSH' used for in message result?
	},
	
	EntityType: {
		PLAYER:	'player'
	},
	
	// 3/5/17 ME: not sure how BornPlace.width/height relates to client view 
	// 3/5/17 A: widht and height is the random number range added to x, y
	BornPlace: {
		x: 0,
		y: 0,
		width: 126,
		height: 129
	},
	
	PLAYER: {
		initAreaId: 1
	}
}
