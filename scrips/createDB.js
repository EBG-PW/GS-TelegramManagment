require('dotenv').config();
var mysql = require('mysql');

var db = mysql.createPool({
    connectionLimit : 100,
    host: process.env.DB_Host,
    user: process.env.DB_User,
    password: process.env.DB_Passwort,
    charset : 'utf8mb4_bin'
});

let sqlcmd = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_Name};`;
let sqlcmdtable = "CREATE TABLE IF NOT EXISTS `users` (`userID` DOUBLE NOT NULL,`language` varchar(255), `permissions` varchar(255), `allowRegister` tinyint(1), `time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`userID`));";
let alterTable = "ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;";

let sqlcmdtable2 = "CREATE TABLE IF NOT EXISTS `servers` (`useridBan` DOUBLE NOT NULL,`useridAdmin` DOUBLE NOT NULL, `BanID` varchar(255), `reason` varchar(255), `time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (`useridBan`,`BanID`,`reason`));";
let alterTable2 = "ALTER TABLE `servers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;"

db.getConnection(function(err, connection){
    if(err) throw err;
	console.log(`Connected to ${process.env.DB_Host}`);
	connection.query(sqlcmd, function(err, result){
        connection.release();
        if(err) throw err;
			console.log(`Database ${process.env.DB_Name} created`);
        });
});

db.getConnection(function(err, connection){
    if(err) throw err;
	connection.query(`USE ${process.env.DB_Name};`, function(err, result){
		console.log(`DB switched ${process.env.DB_Name}`);
		connection.query(sqlcmdtable, function(err, result){
            if(err) throw err;
			console.log("Table users created");
		});
		connection.query(alterTable, function(err, result){
            if(err) throw err;
			console.log("Table users set to other character set");
        });
        connection.release();
	});
});