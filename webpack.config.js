const path = require('path');

module.exports = {
  entry: './src/sketch.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false  
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    globalObject: "this",
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    "p5":"p5"
  }
};