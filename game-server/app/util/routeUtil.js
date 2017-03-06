var exp = module.exports;

exp.connector = function(session, msg, app, cb) {
	if (!session) {
		cb(new Error('fail to route to connector server for session is empty'));
		return;
	}
	
	if (!session.frontendId) {
		cb(new Error('fail to bind frontend id in session'));
		return;
	}
	
	cb(null, session.frontendId);
};
