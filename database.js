var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var _db;
var url = 'mongodb://cnc:cnc@ds031257.mlab.com:31257/cncdb'; // mlab URL

module.exports = {
    connect: function (callback) {
        MongoClient.connect(url, function (err, db) {
            console.log("Connected to database");
            _db = db;
            return callback(err);
        });
    },

    getDb: function () {
        console.log("_db: " + _db);
        return _db;
    }
};