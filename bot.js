const linebot = require('linebot');
const config = require('./config');
const db = require('./db').get_db();

var bot = linebot({
	channelId: config.channelId,
	channelSecret: config.channelSecret,
	channelAccessToken: config.token
});

function upsert_callback(err, data){
	if(err) console.log(err);
}

function reply(event, msg){
	event.reply(msg)
	.then(function(data) {
		console.log(data);
	})
	.catch(function(error) {
		console.log(error);
	});
}

bot.on('message', function(event) {
	var uid = event.source.userId;
	console.log('[LOG] '+uid);
	if(event.message.type == 'text'){
		var cmd = event.message.text;
		console.log("[DEBUG] get text: "+cmd);
		var reply_msg = "";

		switch(cmd){
		case '路況地圖':
			var reply_msg = "";
			db.collection("user_location").findOne({"uid":uid},function(err, data){
				var uri = "https://drive-helper.herokuapp.com/?place=holder"
				if(err) console.log('[err] '+err);
				if(data.lat) uri += "&lat="+data.lat;
				if(data.lng) uri += "&lng="+data.lng;
				if(data.destination) uri += "&dst="+data.destination;
				reply_msg = {
				  "type": "template",
				  "altText": "顯示目前地圖",
				  "template": {
				    "type": "buttons",
					"imageAspectRatio": "rectangle",
					"imageSize": "cover",
					"imageBackgroundColor": "#FFFFFF",
					"title": "路況地圖",
					"text": "目前市區擁擠狀況",
					"actions": [
					  { "type": "uri", "label": "Show",
					    "uri": uri}
					]
				  }
				}
				reply(event, reply_msg);
			});
			break;
		case '設定目的地':
			reply_msg = '請直接以文字輸入目的地';
			db.collection("user_location").updateOne({"uid":uid},{ $set: {"waiting":true}}, {upsert: true}, function(err, data){
				if(err)console.log(err);
				reply(event, reply_msg);
			});
			break;
		default:
			db.collection("user_location").findOne({"uid":uid},function(err, data){
				if(data.waiting){
					reply_msg = "將目的地設為"+event.message.text;
					reply(event, reply_msg);
					db.collection("user_location").updateOne({"uid":uid},{ $set: {"waiting":false, "destination":event.message.text}}, {upsert: true}, upsert_callback);
				}
				else{
					reply_msg = "抱歉, 機器人暫時還不能理解"+cmd+"是什麼意思";
					reply(event, reply_msg);
				}
			});
		}
	}
	else if(event.message.type == 'location'){
		console.log("[DEBUG] get location");
		var lat = event.message.latitude;
		var lng = event.message.longitude;
		db.collection("user_location").updateOne({"uid":uid}, { $set: {"lat": lat, "lng": lng}}, {upsert: true}, function(err, data){
			var reply_msg = "";
			db.collection("user_location").findOne({"uid":uid},function(err, data){
				var uri = "https://drive-helper.herokuapp.com/?place=holder"
				if(err) console.log('[err] '+err);
				if(data.lat) uri += "&lat="+data.lat;
				if(data.lng) uri += "&lng="+data.lng;
				if(data.destination) uri += "&dst="+data.destination;
				console.log(uri);
				reply_msg = {
				  "type": "template",
				  "altText": "顯示目前地圖",
				  "template": {
				    "type": "buttons",
					"imageAspectRatio": "rectangle",
					"imageSize": "cover",
					"imageBackgroundColor": "#FFFFFF",
					"title": "路況地圖",
					"text": "目前市區擁擠狀況",
					"actions": [
					  { "type": "uri", "label": "Show",
					    "uri": uri}
					]
				  }
				};
				reply(event, reply_msg);
			});
		});
	}
	else{
		console.log("[DEBUG] get type"+event.message.type);
	}
});

module.exports = bot;
