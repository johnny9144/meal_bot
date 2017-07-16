"use strict";
const path = require("path");
global.conf = require( path.join( __dirname, "config.js"));
const TelegramBot = require("node-telegram-bot-api");
const debug = require("debug")("dev:main");
const fs = require("fs");
const api = require( path.join( __dirname, "libs", "api"));
const provider = new api();
const token = conf.token;
const bot = new TelegramBot( token, {
  polling: true
});
var data = {};

try {
  data = require( path.join( __dirname, "data.json"));
} catch ( e) {
  debug( e);
  data = {};
}

debug( "init ...");
bot.onText( /@brandma_bot (.+)/, ( msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1]; 
  let input = [];

  try {
    input = resp.split( /\s+/g);
  } catch( e) {
    debug( e);
  }

  if ( !input.length === 0) {
    return bot.sendMessage( chatId, "format error");
  }

  switch( input[0]) {
    case "/new":
      if ( data[input[1]]) {
        return bot.sendMessage( chatId, "name is used!");
      }

      data[input[1]] = {
        date: new Date(),
        content: {},
      };

      bot.sendMessage( chatId, `Order: ${ input[1]} created!`);
      saveData( data);
      break;
    case "/status":
      if ( !data[input[1]]) {
        return bot.sendMessage( chatId, "Order not found!");
      }

      {
        let msgOut = [];
        for( let val in data[input[1]].content) {
          let obj = data[input[1]].content[val];
          msgOut.push( `${ val} (${ obj.count}): ${ obj.person.join( " ,")}`);
        }
        if( msgOut.length === 0) {
          bot.sendMessage( chatId, "Order is null");
        } else {
          bot.sendMessage( chatId, msgOut.join( "\n"));
        }
      }

      break;
    case "/close":
      if ( !data[input[1]]) {
	      return bot.sendMessage( chatId, "Order not found!");
      }

      {
	      let msgOut = [];
	      for( let val in data[input[1]].content) {
		      let obj = data[input[1]].content[val];
		      msgOut.push( `${ val} (${ obj.count}): ${ obj.person.join( " ,")}`);
	      }
	      msgOut.push( `Order: ${ input[1]} closed!`);
	      bot.sendMessage( chatId, msgOut.join( "\n"));
      }

      delete data[input[1]];
      saveData( data);
      break;
    case "/checkDomain": 
      if( !input[1]) {
        return bot.sendMessage( chatId, "please input domain name");
      }
      let domain = input[1].split( ".");
      if ( domain.length !== 2) {
        return bot.sendMessage( chatId, "please input the correct domain name");
      }

      provider.checkDomain( domain.join( "."), function ( err, result, body) {
        if( err) {
          return bot.sendMessage( chatId, "api crash");
        } 
        if( body.code !== 1000) {
          return bot.sendMessage( chatId, body.msg);
        }
        let out = `Domain: ${ body.data.domain}\nAvailable: ${ body.data.availability}\nClaims: ${ body.data.isClaims}\n`;
        if( body.data.fee) {
          out += "Fee: " + JSON.stringify( body.data.fee, null, 2);
        }
        bot.sendMessage( chatId, out);
      });
      break;
    case "/add":
      if ( !data[input[1]]) {
        return bot.sendMessage( chatId, "Order not found!");
      }
      if ( !data[input[2]]) {
        return bot.sendMessage( chatId, "Meal not found!");
      }
      if ( data[input[1]].content[input[2]]) {
        data[input[1]].content[input[2]].count += 1;
        data[input[1]].content[input[2]].person.push( msg.from.username);
      } else {
        data[input[1]].content[input[2]] = {
          count: 1,
          person: [ msg.from.username],
        };
      }
      bot.sendMessage( chatId, `add : ${ input[2]}`);
      saveData( data);
      break;
    default:
      bot.sendMessage( chatId, "懶得理你~");
      break;
  }

});



function saveData( json) {
	fs.writeFile( path.join( __dirname, "data.json"), JSON.stringify( json, null, 2), 'utf8', function ( err) {
			if ( err) {
			debug( err);
			}
			});
}
