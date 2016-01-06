var util = require('util');
var webpack = require('webpack');
var EventEmitter = require('events').EventEmitter;

function Compiler(clientConfig) {
  EventEmitter.call(this);

  this.client = webpack(clientConfig);

  this.client.plugin('compile', this.onClientCompile.bind(this));
  this.client.plugin('done', this.onClientDone.bind(this));
}

util.inherits(Compiler, EventEmitter);

Compiler.prototype.onClientCompile = function() {

};

Compiler.prototype.onClientDone = function(stats) {
  if (stats.compilation.errors && stats.compilation.errors.length > 0) {
    this.emit('errors', stats.compilation.errors);
  } else {
    this.hash = stats.hash;
    console.log('Compile finished');
  }
};

Compiler.prototype.start = function() {
  this.client.watch({}, function() {});
};

module.exports = Compiler;
