const express = require('express');
const body_parser = require('body-parser');

const app = express();
const config = require('./config');
const db_util = require('./db');

db_util.connect(function(err){
	var db = db_util.get_db();

	app.set('view engine', 'ejs');
	app.use(body_parser.urlencoded({extended: false}));

	// bot setting
	var bot = require('./bot');
	app.use('/bot_api', bot.parser());


	// web setting
	app.get('/', function(req, res){
		lat = req.query.lat || 24.956810;
		lng = req.query.lng || 121.221898;
		destination = req.query.dst || false;
		
		db.collection("bus_pos").find({}).toArray(function(err, bus){
			res.render('index',{
				title: 'maps',
				token: config.google_token,
				lat: lat,
				lng: lng,
				bus: bus,
				destination: destination
			});
		});
	});

	app.get('/db_debug',function(req, res){
		var db = db_util.get_db();
		db.collection('user_location').find({}).toArray(function(err, result){
			if(err) res.send(err);
			else res.send(result);
		});
	});

	// start app
	var server = app.listen(process.env.PORT || 8080, function() {
		var port = server.address().port;
		console.log('App in fact running on port', port);
	});

}); //db connection

