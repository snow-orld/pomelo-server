var mysql = require('./mysql/mysql');
var userDao = module.exports;

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByName = function (username, cb){
  var sql = 'select * from  User where name = ?';
  var args = [username];
  mysql.query(sql,args,function(err, res){
    if(err !== null){
      cb(err.message, null);
    } else {
      if (!!res && res.length === 1) {
        var rs = res[0];
        var user = {id: rs.id, name: rs.name, password: rs.password, salt: rs.salt, from: rs.from};
        cb(null, user);
      } else {
        cb(' user not exist ', null);
      }
    }
  });
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (username, password, salt, from, cb){
  var sql = 'insert into User (name,password,salt,`from`,loginCount,lastLoginTime) values(?,?,?,?,?,?)';
  var loginTime = Date.now();
  var args = [username, password, salt, from || '', 1, loginTime];
  mysql.insert(sql, args, function(err,res){
    if(err !== null){
      cb({code: err.code, msg: err.message}, null);
    } else {
      var userId = res.insertId;
      var user = {id: res.insertId, name: username, password: password, salt: salt, loginCount: 1, lastLoginTime:loginTime};
      cb(null, user);
    }
  });
};



