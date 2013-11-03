var request = require('http').request;

var options = {
  socketPath: '/var/run/docker.sock',
  path: '/build?t=ooga',
  method: 'POST',
};

var req = request(options);

req.on('response', function (res) {

  res.on('data', function (chunk) {
    process.stdout.write(chunk.toString());
  });

  res.on('end', function () {
    console.log('DONE');
  });

});

req.on('error', function (error) {
  console.log(error);
});

var stream = process.openStdin();
stream.pipe(req);

stream.on('end', function () {
  req.end();
});
