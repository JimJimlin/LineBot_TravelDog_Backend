var config = require('config');
var linebot = require('linebot');
var express = require("express");
var logfmt = require("logfmt");
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = process.env.DB_Mongo || config.get('DB.MONGO');  
var bot_channelId = process.env.Line_channelId || config.get('LINE.channelId');
var bot_channelSecret = process.env.Line_channelSecret || config.get('LINE.channelSecret');
var bot_channelAccessToken = process.env.Line_channelAccessToken || config.get('LINE.channelAccessToken');

var bot = linebot({
    channelId: bot_channelId,
    channelSecret: bot_channelSecret,
    channelAccessToken: bot_channelAccessToken,
    verify: true
});

bot.on('message', function(event) {
  console.log(event); //把收到訊息的 event 印出來看看
});

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

bot.on('message', function(event) {
  if (event.message.type = 'text') {
    var useId = event.source.userId;
    event.source.profile().then(function (profile) {
        useId = profile.displayName;
    })
    var msg = event.message.text;
    var msg_reply = ''; //回覆用訊息
    if(msg.indexOf(';') > 0 && msg.split(';').length >= 3 ){
       // like r;12.2567098;24.234706
       var comm = msg.split(';')[0];
       var local_X = msg.split(';')[1];
       var local_Y = msg.split(';')[2];
       var description = '';
       for(var index = 3 ; index < msg.split(';').length; index++){
         description  += msg.split(';')[index];
       }

       if(comm === 'r'){
          MongoClient.connect(DB_CONN_STR, function(err, db) {
          var collection = db.collection('map');
          var data = {name: useId, 
                    local_X: local_X, 
                    local_Y: local_Y,
                    description: description};
          collection.insert(data, function(err, result) { 
                console.log(result);
                event.reply('記錄好囉!!');
              }
          );
        }); // MongoClient.connect
       }// if(comm == 'r')
  }else if(msg.indexOf(';') > 0 && msg.split(';').length < 3 && msg.split(';')[0] === 'r'){
    event.reply('靠杯阿，講話講清楚一點啊!!');
  }
}});
