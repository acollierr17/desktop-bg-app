const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = [
  new CleanWebpackPlugin(),
  new ForkTsCheckerWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(path.resolve(), 'src/styles/index.css'),
        to: path.join(path.resolve(), '.webpack/renderer/index.css')
      },
      {
        from: path.join(path.resolve(), 'node_modules/wallpaper/source/win-wallpaper.exe'),
        to: path.join(path.resolve(), '.webpack/renderer/native_modules/win-wallpaper.exe')
      },
    ],
  }),
];
