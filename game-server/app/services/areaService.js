/**
 * area Service now only redirects player's state infomation using messageService
 */
var pomelo = require('pomelo');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
//var dataApi = require('../util/dataApi');
var utils = require('../util/utils');
var userDao = require('../dao/userDao');
var Map = require('../domain/map/map');

var maps = {};

var exp = module.exports;

exp.init = function() {
	
	// Init areas
	var areas = {[{id: 1}]};
	
	for (var k in areas) {
		// Init map
		var area = areas[k];
		
		area.weightMap = false;
		maps[area.id] = new Map(area);
	}
};

