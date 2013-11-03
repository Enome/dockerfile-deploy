require('colors');

var async = require('async');
var functions = require('./functions');

var inspect = function (callback) {

  async.waterfall([

    function (next) { next(null, {}); },

    function (state, next) {

      functions.ps(function (err, data) {

        if (err) {
          return next(err);
        }

        state.ids = data.split('\n');
        state.ids.pop();
        next(null, state);

      });

    },

    function (state, next) {

      functions.inspectMultiple(state.ids, function (err, data) {

        if (err) {
          return next(err); 
        }
        
        state.inspects = data;
        next(null, state);
      
      });

    },

  ], function (err, result) {

    if (err) {
      return console.log('--->'.red, err);
    }

    callback(result.inspects);

  });

};

module.exports = inspect;
