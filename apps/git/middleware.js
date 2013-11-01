var spawn = require('child_process').spawn;

var middleware = {

  noCacheHeaders: function (req, res, next) {
    res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.setHeader('Content-Type', 'application/x-git-receive-pack-advertisement');
    next();
  },

  repositoryPath: function (req, res, next) {
    res.locals.repository_path = '/tmp/' + req.params.repository;
    next();
  },

  gitPacketHeader: function (req, res, next) {
    var pack = function (s) {
      var n = (4 + s.length).toString(16);
      return Array(4 - n.length + 1).join('0') + n + s;
    };

    var packet = pack('# service=git-receive-pack\n');
    res.write(packet + "0000");
    next();
  },

  gitAdvertiseRefs: function (req, res) {
    var args = ['--stateless-rpc', '--advertise-refs', res.locals.repository_path];
    var git = spawn('git-receive-pack', args);

    git.stdout.pipe(res);

    git.stderr.on('data', function (data) {
      return console.log("stderr: " + data);
    });
  },

};

module.exports = middleware;
