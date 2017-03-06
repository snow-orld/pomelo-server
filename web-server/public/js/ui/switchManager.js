define(function() {
	
	var switchManager = Object();
	
	var curViewNameId = "loginPanel";
	
	switchManager.selectView = function(viewNameId) {
		if (!viewNameId || curViewNameId === viewNameId) {
			return;
		}
		
		var oldView = $('#' + curViewNameId);
		var newView = $('#' + viewNameId);
		
		oldView.addClass('g-hide');
		newView.removeClass('g-hide');
		
		curViewNameId = viewNameId;
	}
	
	switchManager.getCurrentView = function() {
		return curViewNameId;
	}
	
	return switchManager;
});
