#!/usr/bin/node
/* vim: set filetype=javascript : */

require('colors');

var commander = require('commander');
var functions = require('./functions');

commander
  .version('0.0.1')
  .option('--name <name>')
  .option('--pipe')
  .parse(process.argv);

if (!commander.name) {
  console.log('--->'.red, 'Please specify a name (-n foobar or --name foobar)');
  return;
}

if (commander.pipe) {
  var stream = process.openStdin();
  stream.pause();
  functions.deploy(commander, stream);
}