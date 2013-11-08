#!/usr/bin/node
require('colors');
var async = require('async');
var functions = require('./functions');

setInterval(function () {

  async.waterfall([

    function (next) { next(null, {}); },
    functions.connectRedisClient,
    functions.inspect,
    functions.info,
    functions.hostname,
    functions.createSubDomainFrontendData,
    functions.createDomainFrontendData,
    functions.createWildcardDomainFrontendData,
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
