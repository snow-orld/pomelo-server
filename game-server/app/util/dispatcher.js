//var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
	// get the least 8 characters in uid string
	var id = 0;
	for (var i = 12; i > 0; i--) {
		id += uid.charCodeAt(uid.length - i);
	};
	id = id % 65535;
	var index = id % connectors.length;
	return connectors[index];
}
