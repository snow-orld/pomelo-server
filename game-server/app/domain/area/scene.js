var Area = require('./area');

var exp = module.exports;

var area = null;

exp.init = function(opts) {
	if (!area) {
		area = new Area(opts);
	}
};

exp.getArea = function() {
	return area;
};
