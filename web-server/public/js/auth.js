$('#regBtn').on('click', register);
$('#loginBtn').on('click', login);

function register() {
	var username = $('#regName').val().trim();
	var password = $('#regPwd').val().trim();
	
	alert("Register!\nUsername = " + username + "\nPassword = " + password);
	
	// connect to db insert into Users
}

function login() {
	var username = $('#loginName').val().trim();
	var password = $('#loginPwd').val.trim();
	
	// just for tmp usage, for 1st demo
	if (username == 'test') {
		if (password == '123') {
			alert('Successfully logged in!');
			// Jumping to 1st page user should see after login
		} else {
			alert('Username and password does not match!');
		}
	} else {
		alert('User does not exist!');
	}
}
