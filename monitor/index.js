require('colors');

var async = require('async');
var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;

var ping = function () {

  var ee = new EventEmitter();

  async.waterfall([

    function (state, next) {

      functions.ps(function (err, data) {

        if (err) {
          return next(err);
        }

        state.ids = data.split('\n');
        state.ids.pop();
        next(null, state);

      });

    }.bind(null, {}),

    function (state, next) {

      functions.inspectMultiple(state.ids, function (err, data) {

        if (err) {
          return next(err); 
        }
        
        state.inspects = data;
        next(null, state);
      
      });

    },

    /*
    function (state, next) {

    },
    */

  ], function (err, result) {

    console.log('--->'.red, err);
    console.log('--->'.green, result.inspects);

  });

};

setInterval(ping, 1000);
