require('dotenv').config();
const f = require('./lib/Funktions');
const OS = require('./lib/Hardware');
const ping = require('ping');
const package = require('../package');
const fs = require('fs');
const SQL = require('./lib/MySQL')
const newI18n = require('new-i18n');
const i18n = newI18n(__dirname + '/../languages', ['en', 'de'], 'de');

const Telebot = require('telebot');
const bot = new Telebot({
	token: process.env.Telegram_Bot_Token,
	limit: 1000,
        usePlugins: ['commandButton']
});

var Time_started = new Date().getTime();

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
            }).catch(error => console.log(error));
            bot.deleteMessage(msg.chat.id, msg.message_id).catch(error => f.Elog('Error (deleteMessage):' + error.description));
		});
	});
});

bot.on([/^\/help/i, /^\/hilfe/i], (msg) => {

});

bot.on([/^\/start/i], (msg) => {

	if ('language_code' in msg.from) {
        if (i18n.languages.includes(msg.from.language_code)) {
			var FirstLang = msg.from.language_code
        }else{
			var FirstLang = config.language
		}
    }else{
		var FirstLang = config.language
	}

	let replyMarkup = bot.inlineKeyboard([
		[
			bot.inlineButton(i18n(FirstLang, 'language.de'), {callback: `${msg.from.id}_Clang_de`}),
			bot.inlineButton(i18n(FirstLang, 'language.en'), {callback: `${msg.from.id}_Clang_en`})
		]

	]);
	msg.reply.text(i18n(FirstLang, 'start.Willkommen'), {parseMode: 'html', replyMarkup}).catch(error => f.Elog('Error (SendStart):' + error.description));
});

bot.on([/^\/language/i, /^\/sprache/i], (msg) => {
	SQL.GetUserLang(msg.from.id).then(function(lang) {
		if(Object.entries(lang).length !== 0){
			let replyMarkup = bot.inlineKeyboard([
				[
					bot.inlineButton(i18n(lang[0].language, 'language.de'), {callback: `${msg.from.id}_lang_de`}),
					bot.inlineButton(i18n(lang[0].language, 'language.en'), {callback: `${msg.from.id}_lang_en`})
				]

			]);
			msg.reply.text(i18n(lang[0].language, 'sprache.Message'), {parseMode: 'html', replyMarkup}).catch(error => f.Elog('Error (SendStart):' + error.description));
		}else{
			var Message = [];
			for (i = 0; i < i18n.languages.length; i++) {
				Message.push(i18n(i18n.languages[i], 'sprache.FehlendeRegestrierung'))
			}
			msg.reply.text(Message.join("\n"), {parseMode: 'html'}).catch(error => f.Elog('Error (SendStart):' + error.description));
		}
	}).catch(error => console.log(error));
});

bot.on('callbackQuery', (msg) => {
	f.log("User: " + msg.from.username + "(" + msg.from.id + ") sended request with data " + msg.data)
	
	if ('inline_message_id' in msg) {	
		var inlineId = msg.inline_message_id;
	}else{
		var chatId = msg.message.chat.id;
		var messageId = msg.message.message_id;
	}

	var data = msg.data.split("_")
	if(parseInt(data[0]) === msg.from.id)	//Button is only usable by the creator
	{
		if(data[1] === "Clang"){
			SQL.CreateUser({UserID: msg.from.id, language: data[2]}).then(function(result) {
				var Message = i18n(data[2], 'start.NachSprachEinabe')
				if ('inline_message_id' in msg) {
					bot.editMessageText(
						{inlineMsgId: inlineId}, Message,
						{parseMode: 'html'}
					).catch(error => console.log('Error:', error));
				}else{
					bot.editMessageText(
						{chatId: chatId, messageId: messageId}, Message,
						{parseMode: 'html'}
					).catch(error => console.log('Error:', error));
				}
			}).catch(function(error) {
				var Message = "";
					if(error.code === "ER_DUP_ENTRY"){
						bot.answerCallbackQuery(msg.id,{
							text: i18n(data[2], 'start.AlreadyReg'),
						});
						Message = i18n(data[2], 'start.AlreadyReg')
					}else{
						bot.answerCallbackQuery(msg.id,{
							text: i18n(data[2], 'start.UnknownError'),
						});
						Message = i18n(data[2], 'start.UnknownError')
					}
					if ('inline_message_id' in msg) {
						bot.editMessageText(
							{inlineMsgId: inlineId}, Message,
							{parseMode: 'html'}
						).catch(error => console.log('Error:', error));
					}else{
						bot.editMessageText(
							{chatId: chatId, messageId: messageId}, Message,
							{parseMode: 'html'}
						).catch(error => console.log('Error:', error));
					}
			});
		}else if(data[1] === "lang"){
			SQL.SetUserLang({UserID: msg.from.id, language: data[2]}).then(function(result) {
				var Message = i18n(data[2], 'sprache.WurdeGeändert')
				if ('inline_message_id' in msg) {
					bot.editMessageText(
						{inlineMsgId: inlineId}, Message,
						{parseMode: 'html'}
					).catch(error => console.log('Error:', error));
				}else{
					bot.editMessageText(
						{chatId: chatId, messageId: messageId}, Message,
						{parseMode: 'html'}
					).catch(error => console.log('Error:', error));
				}
			}).catch(function(error) {
				console.log(error)
			});
		}
	}else{ 	//Usable by everyone

	}
});

bot.start();

