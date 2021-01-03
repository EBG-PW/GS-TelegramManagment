require('dotenv').config();
const mysql = require('mysql');

var db = mysql.createPool({
	connectionLimit : 100,
	host: process.env.DB_Host,
	user: process.env.DB_User,
	password: process.env.DB_Passwort,
	database: process.env.DB_Name,
	charset : 'utf8mb4_bin'
});


let CreateUser = function({ UserID, language}) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
            var sqlcmd = "INSERT INTO users (userID, language, permissions, allowRegister) VALUES ?";
			var values = [[UserID, language, "user", "0"]];
			connection.query(sqlcmd, [values], function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		});
	});
}

let GetUserLang = function(UserID) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `SELECT language FROM users where userID = ${UserID};`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

let SetUserLang = function({ UserID, language }) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			if(err) reject(err);
			var sqlcmd = `UPDATE users SET language = '${language}' WHERE userID = '${UserID}';`
			connection.query(sqlcmd, function(err, rows, fields) {
				if(err) reject(err);
				connection.release();
				resolve(rows);
			});
		})
	})
}

module.exports = {
	CreateUser,
	GetUserLang,
	SetUserLang
};