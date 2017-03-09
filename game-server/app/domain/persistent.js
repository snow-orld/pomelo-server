var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * Persisten object, it triggers save event to save data to database
 *
 * @param		{Object}	opts
 * @api public
 *
 */
var Persistent = function(opts) {
	this.id = opts.id;
	this.type = opts.type;		// 3/8/17 ME: for now only domain/account/car.js requires persistent; there is no type associated with car? is the 'type' related to Entity.Type? in LOP, bag.items[key].type exists. --> Guess: in LOP, entityType is used to differentiate entities that apear on the map.
	EventEmitter.call(this);
};

util.inherits(Persistent, EventEmitter);

module.exports = Persistent;

// Emit the 'save' event
Persistent.prototype.save = function() {
	this.emit('save');
};
