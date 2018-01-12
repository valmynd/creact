module.exports = {
  entry: {
    'app': './src/examples/kdtree/example.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
    library: 'bundle',
    libraryTarget: 'var',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: []
};
