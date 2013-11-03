var docker = require('../docker');
var async = require('async');

var functions = {

  ps: function (next) {
    var child = docker('ps', '-q');

    child.on('error', function (error) {
      next(error);
    });

    child.on('end', function (error, data) {
      next(error, data);
    });
  },

  inspect: function (name, next) {
    var child = docker('inspect', name);
    child.on('end', function (error, data) {
      next(error, JSON.parse(data)[0]);
    });
  },

  inspectMultiple: function (names, next) {
    async.map(names, functions.inspect, function (error, data) {
      next(error, data);
    });
  },

};

module.exports = functions;
