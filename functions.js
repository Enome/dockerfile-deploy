var tar = require('tar');
var temp = require('temp');
var async = require('async');
var spawn = require('child_process').spawn;

var docker = require('./docker');

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
        return console.log('--->'.red, err);
      }
      console.log('--->'.green, 'DONE');
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

    var bailout = false;
    state.stream.resume();
    var tar_stream = state.stream.pipe(tar.Extract({ path: state.path }));

    tar_stream.on('error', function (err) {
      next(err);
      bailout = true;
    });

    tar_stream.on('end', function () {
      if (!bailout) {
        console.log('--->'.green, 'Extracted tar to ' + state.path);
        next(null, state);
      }
    });

  },

  buildDockerImage: function (state, next) {

    var bailout = false;
    var child = docker('build', '-t', 'image-' + state.name, state.path);

    child.on('error', function (error) {

      // Exception because docker uses stderr for informal messages.
      if (error.toString().indexOf('Uploading context') === 0) {
        return process.stdout.write(error.toString());
      }

      next(error.toString());
      bailout = true;

    });

    child.on('data', function (data) {
      process.stdout.write(data.toString());
    });

    child.on('end', function () {

      if (!bailout) {
        console.log('--->'.green, 'image-' + state.name + ' image created.');
        next(null, state);
      }

    });

  },

  inspectDockerContainer: function (state, next) {

    var bailout = false;
    var child = docker('inspect', 'container-' + state.name);

    child.on('error', function (error) {
      next(null, state);
      console.log('--->'.green, 'container-' + state.name + ' doesn\t exist.');
      bailout = true;
    });

    child.on('end', function (error, data) {
      if (!bailout) {
        console.log('--->'.green, 'container-' + state.name + ' already exist.');
        state.inspect = data;
        next(null, state);
      }
    });
  
  },

  killDockerContainer: function (state, next) {

    try {
      JSON.parse(state.inspect);

      var bailout = false;
      var child = docker('kill', 'container-' + state.name);

      child.on('error', function (error) {
        next(error);
        bailout = true;
      });

      child.on('data', function (data) {
        //process.stdout.write(data.toString());
      });

      child.on('end', function (error, data) {
        if (!bailout) {
          console.log('--->'.green, 'container-' + state.name + ' was killed.');
          next(null, state);
        }
      });

    } catch (e) {
      next(null, state);
    }
  },

  removeDockerContainer: function (state, next) {

    try {
      JSON.parse(state.inspect);

      var bailout = false;
      var child = docker('rm', 'container-' + state.name);

      child.on('error', function (error) {
        next(error.toString());
        bailout = true;
      });

      child.on('data', function (data) {
        //process.stdout.write(data.toString());
      });

      child.on('end', function (error, data) {
        if (!bailout) {
          console.log('--->'.green, 'container-' + state.name + ' was removed.');
          next(null, state);
        }
      });
    } catch (e) {
      next(null, state);
    }
  },

  runDockerImage: function (state, next) {

    var bailout = false;
    var child = docker('run', '-d', '-name=container-' + state.name, 'image-' + state.name);

    child.on('error', function (error) {
      next(error.toString());
      bailout = true;
    });

    child.on('data', function (data) {
      //process.stdout.write(data.toString());
    });

    child.on('end', function (error, data) {
      if (!bailout) {
        console.log('--->'.green, state.name + ' is running.');
        next(null, state);
      }
    });

  },

};

module.exports = functions;
