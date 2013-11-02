var csv = require('csv');


docker().ps().execute(function (err, result) {
  //console.log(err, result);
});

docker().inspect('container-enome.be').execute(function (err, result) {
  console.log(err, JSON.parse(result)[0]);
});

return;

var commatize = function (buffer_array) {
  return buffer_array.join('').split('\n').map(function (line) {
    return line.replace(/\s{2,}/g, ',');
  }).join('\n');
};

var parse = function (string, next) {
  var columns = ['ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'];
  csv().from(string, { columns: true }).to.array(next, { columns: columns });
};

var dockerPs = function (next) {

  var args = ['ps'];
  var docker = spawn('docker', args);
  var data = [];
  var error = [];

  docker.stderr.on('data', function (chunk) {
    error.push(chunk);
  });

  docker.stdout.on('data', function (chunk) {
    data.push(chunk);
  });

  docker.stdout.on('end', function () {
    parse(commatize(data), function (data) {
      next(error.toString(), data);
    });
  });

};

var docker

docker.ps.execute(function (err, data) {

});

setInterval(function () {

  docker_ps(function (err, data) {

    data.forEach(function (container) {

      docker_inspect(container.names, function (inspect_data) {
        console.log(inspect_data);
      });

      
    });

  });

}, 1000);
