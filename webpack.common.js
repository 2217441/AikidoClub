const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: './activities.html',
      filename: 'activities.html',
    }),
    new HtmlWebpackPlugin({
      template: './about-us.html',
      filename: 'about-us.html',
    }),
    new HtmlWebpackPlugin({
      template: './mainboard.html',
      filename: 'mainboard.html',
    }),
    new HtmlWebpackPlugin({
      template: './news.html',
      filename: 'news.html',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
};
