var utils = module.exports;

// control variable of func "myPrint"
//var isPrintFlag = false;
var isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
	if (!!cb && typeof cb === 'function') {
		cb.apply(null, Array.prototype.slice.call(arguments, 1));
	}
};

/**
 * Clone an object - deep copy
 */
utils.clone = function(origin) {
	if (!origin) {
		return;
	}
	
	var obj = {};
	for (var f in origin) {
		if (origin.hasOwnProperty(f)) {	// necessary of this condition? isn't it to be true always?
			obj[f] = origin[f];
		}
	}
	
	return obj;
}

/**
 * Get size of an object - in property entries
 */
utils.size = function(obj) {
	if (!obj) {
		return 0;
	}
	
	var size = 0;
	for (var f in obj) {
		if (obj.hasOwnProperty(f)) {
			size++;
		}
	}
	
	return size;
};

// print the file name and the line number ~begin
function getStack() {
	var orig = Error.prepareStackTrace;
	Error.prepareStackTrace = function(_, stack) {
		return stack;
	};
	
	var err = new Error();
	Error.captureStackTrace(err, arguments.callee);
	
	var stack = err.stack;
	Error.prepareStackTrace = orig;
	
	return stack;
}

function getFileName(stack) {
	return stack[1].getFileName();
}

function getLineNumber(stack) {
	return stack[1].getLineNumber();
}

/**
 * Print the file name and line number from stack - ? figure out how this stack get pushed and popped
 */
utils.myPrint = function() {
	if (isPrintFlag) {
		var len = arguments.length;
		if (len <= 0) {
			return;
		}
		var stack = getStack();
		var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
		for (var i = 0; i < len; i++) {
			aimStr += arguments[i] + ' ';
		}
		console.log('\n' + aimStr);
	}
} 
// print the file name and the line number ~end
 
