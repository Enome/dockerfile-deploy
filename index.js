var fs = require('fs');
var https = require('https');
var express = require('express');

var app = express();

require('./apps/git')(app);

var options = {
  key: fs.readFileSync(__dirname + '/privatekey.pem'),
  cert: fs.readFileSync(__dirname + '/certificate.pem')
};

https.createServer(options, app).listen(3000, function () {
  console.log('Dockerfile-deploy running at port 3000');
});
