"use strict";
const TelegramBot = require("node-telegram-bot-api");
const debug = require("debug")("dev:main");
const path = require("path");
const fs = require("fs");
const conf = require( path.join( __dirname, "config.js"));
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
    input = resp.split( " ");
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
        bot.sendMessage( chatId, msgOut.join( "\n"));
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
    default:
      if ( !data[input[0]]) {
        return bot.sendMessage( chatId, "Order not found!");
      }

      if ( data[input[0]].content[input[1]]) {
        data[input[0]].content[input[1]].count += 1;
        data[input[0]].content[input[1]].person.push( msg.from.username);
      } else {
        data[input[0]].content[input[1]] = {
          count: 1,
          person: [ msg.from.username],
        };
      }

      bot.sendMessage( chatId, `add : ${ input[1]}`);
      saveData( data);
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
