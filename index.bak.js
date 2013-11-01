var https = require('https');
var express = require('express');
var fs = require('fs');
var spawn = require('child_process').spawn;

var app = express();

var options = {
  key: fs.readFileSync(__dirname + '/privatekey.pem'),
  cert: fs.readFileSync(__dirname + '/certificate.pem')
};

app.use(express.basicAuth('fs', '1234'));

app.get('/:repository/info/refs', function (req, res) {

  res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/x-git-receive-pack-advertisement');

  var repository_path = '/tmp/' + req.params.repository;

  var pack = function (s) {
    var n = (4 + s.length).toString(16);
    return Array(4 - n.length + 1).join('0') + n + s;
  };

  var packet = pack('# service=git-receive-pack\n');

  res.write(packet + "0000");

  var git = spawn('git-receive-pack', ['--stateless-rpc', '--advertise-refs', repository_path]);
  git.stdout.pipe(res);

  git.stderr.on('data', function (data) {
    return console.log("stderr: " + data);
  });

});

app.post('/:repository/git-receive-pack', function (req, res) {

  res.setHeader('Expires', 'Fri, 01 Jan 1980 00:00:00 GMT');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  res.setHeader('Content-Type', 'application/x-git-receive-pack-advertisement');

  var repository_path = '/tmp/' + req.params.repository;
  var git = spawn('git-receive-pack', ['--stateless-rpc', repository_path]);

  req.pipe(git.stdin);

  git.stdout.pipe(res);

  git.stderr.on('data', function (data) {
    return console.log("stderr: " + data);
  });

});

https.createServer(options, app).listen(3000);
