require('dotenv').config();
const f = require('./lib/Funktions');
const OS = require('./lib/Hardware');
const ping = require('ping');
const package = require('../package');
const fs = require('fs');
const request = require("request");

const Telebot = require('telebot');
const bot = new Telebot({
	token: process.env.Telegram_Bot_Token,
	limit: 1000,
        usePlugins: ['commandButton']
});

/*Standart funktions Start|Alive|Help*/
bot.on(/^\/alive/i, (msg) => {
	OS.Hardware.then(function(Hardware) {
		let Output = "";
		Output = Output + '\n- CPU: ' + Hardware.cpubrand + ' ' + Hardware.cpucores + 'x' + Hardware.cpuspeed + ' Ghz';
		Output = Output + '\n- Load: ' + f.Round2Dec(Hardware.load);
		Output = Output + '%\n- Memory Total: ' + f.Round2Dec(Hardware.memorytotal/1073741824) + ' GB'
		Output = Output + '\n- Memory Free: ' + f.Round2Dec(Hardware.memoryfree/1073741824) + ' GB'
		ping.promise.probe('api.telegram.org').then(function (ping) {
			msg.reply.text(`Botname: ${package.name}\nVersion: ${package.version}\nPing: ${ping.avg}ms\n\nUptime: ${f.uptime(Time_started)}\n\nSystem: ${Output}`).then(function(msg)
			{
				setTimeout(function(){
				bot.deleteMessage(msg.chat.id,msg.message_id).catch(error => f.Elog('Error (deleteMessage):' + error.description));
				}, 25000);
            });
            bot.deleteMessage(msg.chat.id, msg.message_id).catch(error => f.Elog('Error (deleteMessage):' + error.description));
		});
	});
});

bot.on(/^\/help/i, (msg) => {
	if(fs.existsSync(`${process.env.Admin_DB}/Admins.json`)) {
		var AdminJson = JSON.parse(fs.readFileSync(`${process.env.Admin_DB}/Admins.json`));
	}else{
		msg.reply.text(`Es gibt noch keine Admins...`);
	}
	if(AdminJson["Admins"].includes(msg.from.id)){
		msg.reply.text(`Befehle für Nutzer:\n/help - Zeigt diese Nachricht\n/alive - Zeigt den Bot Status\n\nBefehle für Admins:\n/listRoutes - Zeigt alle Plugins und beispiel\n/listRoutes <Plugin Name> - Zeigt alle Routs\n/routes - Zeigt Hilfe für diesen Befehl\n/routes add|rem <Pluginname> - Erstellt/Löscht Route für Chat\n/listAdmin - Zeigt alle Admins\n/addAdmin - Fügt Nutzer als Admin hinzu\n/remAdmin - Nimmt dem Nutzer Admin weg\n/listUser - Zeigt alle User\n/addUser - Fügt Nutzer als User hinzu\n/remUser - Nimmt dem Nutzer User weg`)
	}else{
		msg.reply.text(`Befehle für Nutzer:\n/help - Zeigt diese Nachricht\n/alive - Zeigt den Bot Status`);
	}
});

bot.start();