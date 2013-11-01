var middleware = require('./middleware');

var git = function (app) {

  app.get('/:repository/info/refs', 
          middleware.noCacheHeaders,
          middleware.repositoryPath,
          middleware.gitPacketHeader,
          middleware.gitAdvertiseRefs
         );

};

module.exports = git;
