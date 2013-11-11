var fs = require('fs');
var tar = require('tar');
var temp = require('temp');
var async = require('async');
var docker = require('../docker');

temp.track();
temp.dir = '/tmp';

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
      functions.parseDockerfileDeployJson,
      functions.runDockerImage,
      functions.logDockerContainer,
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

      bailout = true;
      next(error.toString());

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

    var child = docker('inspect', 'container-' + state.name);

    child.on('error', function () {});

    child.on('end', function (error, data) {

      if (error) {
        console.log('--->'.green, 'container-' + state.name + ' doesn\'t exist.');
      } else {
        console.log('--->'.green, 'container-' + state.name + ' exist.');
        state.inspect = data;
      }

      next(null, state);

    });
  
  },

  killDockerContainer: function (state, next) {

    try {
      JSON.parse(state.inspect);

      var child = docker('kill', 'container-' + state.name);

      child.on('error', function (error) {});

      child.on('data', function (data) {
        //process.stdout.write(data.toString());
      });

      child.on('end', function (error, data) {

        if (error) {
          return next(error);        
        }

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

      var child = docker('rm', 'container-' + state.name);

      child.on('error', function (error) {});

      child.on('data', function (data) {
        // Verbose?
        //process.stdout.write(data.toString());
      });

      child.on('end', function (error, data) {

        if (error) {
          return next(error); 
        }

        console.log('--->'.green, 'container-' + state.name + ' was removed.');
        next(null, state);

      });
    } catch (e) {
      next(null, state);
    }
  },

  parseDockerfileDeployJson: function (state, next) {

    fs.readFile(state.path + '/dockerfile-deploy.json', function (err, data) {

      if (err) {

        if (err.code === 'ENOENT') {
          console.log('--->'.grey, 'No dockerfile-deploy.json file found, skipping.');
          return next(null, state);
        }

        return next(err); 

      }

      try {
        state.dockerfile_deploy_json = JSON.parse(data);
      } catch (e) {
        return next('Parsing dockerfile-deploy.json resulted in the following error: ' + e);
      }

      next(null, state);
    
    });
  
  },

  runDockerImage: function (state, next) {

    var args = ['run', '-d', '-name=container-' + state.name];

    if (state.dockerfile_deploy_json && state.dockerfile_deploy_json['run-args']) {
      args.push.apply(args, state.dockerfile_deploy_json['run-args']);
    }

    args.push('image-' + state.name);

    var child = docker.apply(docker, args);

    child.on('error', function (error) {});

    child.on('data', function (data) {
      // Verbose?
      //process.stdout.write(data.toString());
    });

    child.on('end', function (error, data) {

      if (error) {
        return next(error);
      }

      console.log('--->'.green, 'running container-', state.name);
      next(null, state);

    });

  },

  logDockerContainer: function (state, next) {

    var child = docker('logs', 'container-' + state.name);

    child.on('error', function (error) {});

    child.on('end', function (error, data) {

      if (error) {
        console.log('--->'.red, error);
      }

      if (data) {
        console.log('--->'.green, data);
      }

      next(null, state);

    });
  
  }

};

module.exports = functions;
