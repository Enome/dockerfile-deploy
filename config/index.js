var fs = require('fs');

var config = {

  parse: function (next) {

    fs.readfile('/etc/dockerfile-deploy.json', function (err, data) {

      if (err) {
        return next(err); 
      }

      try {
        var notjson = JSON.parse(data);
        next(null, notjson);
      } catch (e) {
        return next(new Error('Couldn\'t JSON.parse the configuration file "/etc/dockerfile-deploy.json"'));
      }
    
    });
  
  }

};

module.exports = config;
