var path = require('path');

module.exports = {
  entry: [
    './examples/webgl/example.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'webgl-example.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        query: {
          plugins: [["transform-react-jsx", {"pragma": "h"}]],
          presets: ['es2015']
        }
      }
    ]
  }
};
