const config = require('./config');
const mongoclient = require('mongodb').MongoClient;

var _db = null;

module.exports = {
	connect: function(callback){
		mongoclient.connect(config.mongo_uri, { useNewUrlParser: true }, function(err, db){
				if(err){
					console.log("[DEBUG] Can't connect to mongo db "+err);
				}
				else _db = db.db("bw");
				return callback(err);
		});
	},

	get_db: function(){
		return _db;
	}
};
