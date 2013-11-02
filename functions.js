var tar = require('tar');
var temp = require('temp');
var async = require('async');
var spawn = require('child_process').spawn;

var functions = {

  deploy: function (commander, stream) {

    var state = {
      name: commander.name,
      stream: stream,
    };

    var fns = [
      functions.createTmpDir.bind(null, state),
      functions.extractTar,
      functions.buildDockerImage,
      functions.inspectDockerContainer,
      functions.killDockerContainer,
      functions.removeDockerContainer,
      functions.runDockerImage,
    ];

    async.waterfall(fns, function (err) {
      if (err) {
        return console.log('--->'.red, 'Something went wrong: ' + err);
      }
      console.log('--->'.green, 'DONE!!!!');
    });

  },

  createTmpDir: function (state, next) {

    temp.mkdir('source-code', function (err, path) {

      if (err) {
        return next(err);
      }

      state.path = path;
      console.log('--->'.green, 'Created temporary directory ' + path);
      next(null, state);

    });

  },

  extractTar: function (state, next) {

    state.stream.resume();
    var tar_stream = state.stream.pipe(tar.Extract({ path: state.path }));

    tar_stream.on('error', function (err) {
      next(err);
    });

    tar_stream.on('end', function () {
      console.log('--->'.green, 'Extracted tar to ' + state.path);
      next(null, state);
    });

  },

  buildDockerImage: function (state, next) {

    var args = ['build', '-t=image-' + state.name + '', state.path ];
    var docker = spawn('docker', args);

    docker.stdout.on('data', function (data) {
      process.stdout.write(data.toString());
    });

    docker.stderr.on('data', function (data) {
      // Would normally stop execution on stderr messages
      // but docker uses it for formal messages as well.
      process.stdout.write(data.toString());
    });

    docker.stdout.on('end', function () {
      console.log('--->'.green, 'image-' + state.name + ' image created.');
      next(null, state);
    });

  },

  inspectDockerContainer: function (state, next) {

    var args = ['inspect', 'container-' + state.name];
    var docker = spawn('docker', args);
    var output = [];

    docker.stdout.on('data', function (data) {
      output.push(data);
    });

    docker.stderr.on('data', function (data) {
      next(null, state);
      next = new Function();
    });

    docker.stdout.on('end', function () {
      state.inspect = output.join('');
      next(null, state);
    });
  
  },

  killDockerContainer: function (state, next) {

    try {
      JSON.parse(state.inspect);
      var args = ['kill', 'container-' + state.name];
      var docker = spawn('docker', args);

      docker.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });

      docker.stderr.on('data', function (data) {
        next(data.toString());
        next = new Function();
      });

      docker.stdout.on('end', function () {
        console.log('--->'.green, 'container-' + state.name + ' was killed.');
        next(null, state);
      });
    } catch (e) {
      next(null, state);
    }
  },

  removeDockerContainer: function (state, next) {

    try {
      JSON.parse(state.inspect);
      var args = ['rm', 'container-' + state.name];
      var docker = spawn('docker', args);

      docker.stdout.on('data', function (data) {
        process.stdout.write(data.toString());
      });

      docker.stderr.on('data', function (data) {
        next(data.toString());
        next = new Function ();
      });

      docker.stdout.on('end', function () {
        console.log('--->'.green, 'container-' + state.name + ' was removed.');
        next(null, state);
      });
    } catch (e) {
      next(null, state);
    }
  },

  runDockerImage: function (state, next) {

    var args = ['run', '-d', '-name=container-' + state.name, 'image-' + state.name];
    var docker = spawn('docker', args);

    docker.stdout.on('data', function (data) {
      process.stdout.write(data.toString());
    });

    docker.stderr.on('data', function (data) {
      // Would normally stop execution on stderr messages
      // but docker uses it for informal messages as well.
      process.stdout.write(data.toString());
    });

    docker.stdout.on('end', function () {
      console.log('--->'.green, state.name + ' is running');
      next(null, state);
    });

  },

};

module.exports = functions;
