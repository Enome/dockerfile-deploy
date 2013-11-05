#!/usr/bin/node

require('colors');

var commander = require('commander');
var functions = require('./functions');

commander
  .version('0.0.1')
  .option('--name <name>')
  .parse(process.argv);

if (!commander.name) {
  console.log('--->'.red, 'Please specify a name (-n foobar or --name foobar)');
  return;
}

var stream = process.openStdin();
stream.pause();
functions.deploy(commander, stream);
