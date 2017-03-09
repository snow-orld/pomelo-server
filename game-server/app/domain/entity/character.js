/**
 * Character Entity
 */

var pomelo = require('pomelo');
var util = require('util');
var utils = require('../../util/utils');
//var dataApi = require('../../util/dataApi');
//var consts = require('../../consts/consts');
var Entity = require('./entity');
var logger = require('pomelo-logger').getLogger(__filename);

/**
 * Initialize a new 'Character' with give opts.
 * Character inherits Entity
 *
 * 3/8/17 ME: for syncing Cars, character is Car
 *
 * @param		{Object}		opts
 * @api 		public
 *
 */
var Character = function(opts) {
	Entity.call(this, opts);
};

util.inherits(Character, Entity);

/**
 * Expose 'Character' constructor.
 */
module.exports = Character;

// 3/5/17 ME: FOR NOW, character is just an interface left for future extension purpose.
// Now it does not differ from 'Player'.
