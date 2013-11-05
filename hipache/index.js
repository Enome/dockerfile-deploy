#!/usr/bin/node

require('colors');

var redis = require('redis');
var async = require('async');

var client = redis.createClient();

var functions = require('./functions');

client.on('error', function (err) {
  console.log(err);
});

setInterval(function () {

  async.waterfall([

    function (next) { next(null, {}); },
    functions.connectRedisClient,
    functions.inspect,
    functions.info,
    functions.hostname,
    functions.createFrontendData,
    functions.getFrontendListsFromRedis,
    functions.addIdentifier,
    functions.filterNewFrontends,
    functions.trimFrontendLists,
    functions.addNewFrontendsToRedis,
    functions.disconnectRedisClient,

  ], function (err) {

    if (err) {
      console.log('--->'.red, err);
    }

  });


}, 2000);
