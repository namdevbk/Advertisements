'use strict';

/**
 * Posts controller for serving user posts.
 */

var route = require('koa-route'),
    mongo = require('../config/mongo'),
    ws = require('../config/ws'),
    ObjectID = mongo.ObjectID;


// register koa routes
exports.init = function (app) {
  app.use(route.get('/api/advertisements', listAdvertisements));
  app.use(route.post('/api/advertisements', createAdvertisements));
};

/**
 * Lists last 15 posts with latest 15 comments in them.
 */
function *listAdvertisements() {
  var advertisements = yield mongo.advertisements.find(
      {},
      {limit: 15, sort: {_id: -1}} /* only get last 15 posts by last updated */).toArray();

  advertisements.forEach(function (advertise) {
    advertise.id = advertise._id;
    delete advertise._id;
  });

  this.body = advertisements;
}

/**
 * Saves a new post in the database after proper validations.
 */
function *createAdvertisements() {
  // it is best to validate post body with something like node-validator here, before saving it in the database..
  var advertise = this.request.body;
  console.log(advertise)
  // conn.once('open', function () {
  //   console.log('open');
  //   var gfs = Grid(conn.db);
 
  //   // streaming to gridfs
  //   //filename to store in mongodb
  //   var writestream = gfs.createWriteStream({
  //       filename: 'mongo_file.txt'
  //   });
  //   fs.createReadStream('/home/etech/sourcefile.txt').pipe(writestream);
 
  //   writestream.on('close', function (file) {
  //       // do something with `file`
  //       console.log(file.filename + 'Written To DB');
  //   });
  //});
  // advertise.createdTime = new Date();
  // var results = yield mongo.advertisements.insertOne(advertise);

  this.status = 201;
  this.body = advertise;
  
}

