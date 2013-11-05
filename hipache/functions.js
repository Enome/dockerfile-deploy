require('colors');
var async = require('async');
var redis = require('redis');
var inspect = require('../inspect');
var config = require('../config');

var functions = {

  connectRedisClient: function (state, next) {
  
    var client = redis.createClient();

    client.on('error', function (err) {
      next(err);
    });

    client.on('ready', function () {
      state.client = client;
      next(null, state);
    });

  },

  inspect: function (state, next) {

    inspect(function (data) {
      state.inspects = data;
      next(null, state);
    });

  },

  info: function (state, next) {

    state.info = state.inspects.reduce(function (memo, container) {

      try {

        var name = container.Name.replace('/container-', '');
        var network_settings = container.NetworkSettings;
        var first_port_info = Object.keys(network_settings.Ports)[0];
        var port = first_port_info.split('/').shift();
        var ip = network_settings.IPAddress;

        memo.push({
          name: name,
          port: port,
          ip: ip,
        }); 
        
      } catch (e) {
        // This mostly will catch errors when the container is created
        // but no port or name is assigned yet.
      }

      return memo;

    }, []);

    next(null, state);

  },

  hostname: function (state, next) {

    config.parse(function (err, data) {

      if (err) {
        return next(err); 
      }

      state.hostname = data;
      next(null, state);

    });

  },

  createFrontendData: function (state, next) {

    state.frontend_data = state.info.map(function (i) {
      var subdomain = i.name;
      var domain = state.hostname;
      var url = subdomain + '.' + domain;
    
      return {
        key: 'frontend:' + url,
        value: 'http://' + i.ip + ':' + i.port,
        name: i.name,
      };

    });

    next(null, state);

  },

  getFrontendListsFromRedis: function (state, next) {
  
    async.each(state.frontend_data, function (data, callback) {

      state.client.lrange([data.key, 0, -1], function (err, list) {

        if (err) {
          return next(err);
        }

        data.redis = list;

        callback();
	
      });

    }, function (err) {

      if (err) {
        return next(err);
      }

      next(null, state);

    });

  },

  addIdentifier: function (state, next) {

    async.each(state.frontend_data, function (data, callback) {

      if (data.redis.length === 0) {

        state.client.rpush([data.key, data.name], function (err) {

          if (err) {
            return callback(err);
          }

          console.log('--->'.green, 'added identifier', data.name.green, 'to frontend', data.key.green);

          callback();

        });
      
      } else {
        callback(); 
      }
    
    }, function (err) {

      if (err) {
        return next(err); 
      }

      next(null, state);
    
    });
  
  },

  filterNewFrontends: function (state, next) {

    state.frontend_new = state.frontend_data.filter(function (data) {
      return data.redis.indexOf(data.value) === -1;
    });

    next(null, state);

  },

  trimFrontendLists: function (state, next) {

    async.each(state.frontend_new, function (data, callback) {

      state.client.ltrim([data.key, 0, 0], function (err) {

        if (err) {
          return callback(err);
        }

        callback();
        
      });

    }, function (err) {

      if (err) {
        return next(err);
      }

      next(null, state);
       
    });
  
  },

  addNewFrontendsToRedis: function (state, next) {

    async.each(state.frontend_new, function (data, callback) {

      state.client.rpush([data.key, data.value], function (err) {

        if (err) {
          return callback(err);
        }

        console.log('--->'.green, 'added backend', data.value.green, 'to frontend', data.key.green);

      });

    }, function (err) {

      if (err) {
        return next(err);
      }

      next(null, state);

    });

  },

  disconnectRedisClient: function (state, next) {
    state.client.quit();
    next(null, state);
  },

};

module.exports = functions;
