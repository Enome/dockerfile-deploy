var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

var docker = function () {

  var args = Array.prototype.slice.call(arguments);
  var ee = new EventEmitter();

  process.nextTick(function () {

    var docker = spawn('docker', args);
    var data = '';
    var error = '';

    docker.stderr.on('data', function (chunk) {
      error += chunk;
      ee.emit('error', chunk);
    });

    docker.stdout.on('data', function (chunk) {
      data += chunk;
      ee.emit('data', chunk);
    });

    docker.stdout.on('end', function () {
      ee.emit('end', error, data);
    });
    
  });

  return ee;

};

module.exports = docker;