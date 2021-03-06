//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');
    
var dbClient = require('./database.js');

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    //mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURL = 'mongodb://cnc:cnc@ds031257.mlab.com:31257/cncdb';
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null;

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
   
    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};



  app.get('/routines', function (req, res, next) {
     var db = dbClient.getDb();
    var collection = db.collection('routines');

    collection.find()
      .toArray(function (err, result) {
        if (err) {
          console.log(err);
        }
        if (result.length) {
          res.send(result);
        }
      });
  });

  app.get('/rewards', function (req, res, next) {
    var db = dbClient.getDb();
    var collection = db.collection('rewards');

    collection.find()
      .toArray(function (err, result) {
        if (err) {
          console.log(err);
        }
        if (result.length) {
          res.send(result);
        }
      });
  });

  app.get('/rewards/:date', function (req, res, next) {
     var db = dbClient.getDb();
    var collection = db.collection('rewards');

    console.log("getrewardbyDate: " + req.params.date);
    collection.find({ date: req.params.date }).toArray(function (err, result) {
      res.send(result);
    });
  });

  app.get('/rewards/:date/:userId', function (req, res, next) {
     var db = dbClient.getDb();
    var collection = db.collection('rewards');

    var cursor = collection.aggregate([
      {
        $match:
        {
          date: req.params.date,
          userId: req.params.userId
        }
      },
      {
        $lookup:
        {
          from: "routines",
          localField: "routineId",
          foreignField: "_id",
          as: "routines"
        }
      }
    ]);

    cursor.toArray(function (err, result) {
      console.log(JSON.stringify(result, undefined, 2));
      res.send(result);
    });
  });

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// initDb(function(err){
//   console.log('Error connecting to Mongo. Message:\n'+err);
// });

dbClient.connect(function (err) {
  app.listen(port, ip);
  console.log('Server running on http://%s:%s', ip, port);
});

module.exports = app ;
