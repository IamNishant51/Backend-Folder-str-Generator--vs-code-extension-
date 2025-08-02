// webpack.config.js
const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src/test') // ✅ exclude test files
        ],
        use: 'ts-loader'
      }
    ]
  },
  externals: {
    vscode: 'commonjs vscode',
    fs: 'commonjs fs',
    path: 'commonjs path'
  },
  mode: 'production',
  devtool: 'source-map'
};
