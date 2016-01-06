var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ComponentResolverPlugin = require('component-resolver-webpack');
var StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

function createClientConfig(config) {
  var clientPath = path.join(config.output, 'client.js');

  var clientContent = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8')
    .replace('${path}', path.join(config.root, 'Application'));
    // .replace("require('react')", "require('" + require.resolve('react') + "')")
    // .replace("require('react-dom')", "require('" + require.resolve('react-dom') + "')");

  fs.writeFileSync(clientPath, clientContent, 'utf8');

  return {
    entry: {
      client: clientPath
    },
    output: {
      path: path.join(config.output, 'client'),
      filename: '[name].js'
    },
    module: {
      loaders: [
        {test: /\.json$/, loader: require.resolve('json-loader')},
        {
          test: /\.jsx?$/,
          loader: require.resolve('babel-loader') + '?' + [
            'presets[]=' + require.resolve('babel-preset-es2015'),
            'presets[]=' + require.resolve('babel-preset-stage-0'),
            'presets[]=' + require.resolve('babel-preset-react'),
            'plugins[]=' + require.resolve('babel-plugin-add-module-exports')
          ].join(','),
          exclude: /(node_modules|bower_components)/
        },
        {test: /\.css$/, loader: ExtractTextPlugin.extract(require.resolve('css-loader') + '?sourceMap')},
        {test: /\.scss$/, loader: ExtractTextPlugin.extract(require.resolve('css-loader') + '?sourceMap!' + require.resolve('sass-loader') + '?sourceMap')},
        {test: /\.(ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: require.resolve('file-loader')},
        {test: /\.(ico|gif|png|jpg)$/, loader: require.resolve('url-loader') + '?limit=8192'}
      ]
    },
    resolve: {
      modulesDirectories: [
        path.join(process.cwd(), 'node_modules'),
        path.join(process.cwd(), 'vendor')
      ],
      extensions: ['', '.js', '.jsx']
    },
    plugins: [
      new ExtractTextPlugin('style.css', {allChunks: true}),
      new webpack.ResolverPlugin([
        new ComponentResolverPlugin()
      ]),
      new StatsWriterPlugin({
        fields: ['hash'],
        filename: 'stats.json'
      })
    ]
    // externals: {
    //   'react-dom': 'commonjs ' + path.join(__dirname, '..', 'node_modules', 'react-dom')
    // }
  };
}

var Compiler = require('./compiler');
var ReactDOM = require('react-dom/server');

module.exports = function(config) {
  var clientConfig = createClientConfig(config);
  var compiler = new Compiler(clientConfig);

  compiler.on('errors', function(errors) {
    errors.forEach(function(err) {
      console.log(err.message);
    });
  });

  compiler.start();

  var SERVER_BUNDLE_PATH = path.join(config.output, 'server', 'client.js');

  return function(req, res, next) {
    // var RootComponent = require(SERVER_BUNDLE_PATH);
    //
    // var content = ReactDOM.renderToString(RootComponent);
    var content = '';
    res.status(200)
      .type('html')
      .send([
        '<!doctype html>',
        '<html lang="en-us">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        '',
        '  <link rel="stylesheet" href="/style.css?' + compiler.hash + '">',
        '</head>',
        '<body>',
        '  <div id="app">' + content + '</div>',
        '  <script src="/client.js?hash=' + compiler.hash + '"></script>',
        '</body>',
        '</html>'
      ].join('\n'));
  };
};
