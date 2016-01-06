var fs = require('fs');
var del = require('del');
var path = require('path');
var serveStatic = require('serve-static');

module.exports = function(app, config) {
  if (config == null) { config = {}; }
  if (config.root == null) { config.root = process.cwd(); }
  if (config.output == null) { config.output = path.join(process.cwd(), '.react-iso'); }

  if (!fs.existsSync(config.output)) { fs.mkdirSync(config.output); }
  if (!fs.statSync(config.output).isDirectory()) { throw new Error('The output (' + config.output + ') must be a directory'); }
  del.sync([path.join(config.output, '*')]);
  fs.mkdirSync(path.join(config.output, 'server'));
  fs.mkdirSync(path.join(config.output, 'client'));

  (config.expose || []).forEach(function(dir) {
    app.use('/' + dir, serveStatic(path.join(config.root, dir)));
  });

  app.use(serveStatic(path.join(config.output, 'client')));

  var foo = require('./foo');
  app.use(foo(config));
};
