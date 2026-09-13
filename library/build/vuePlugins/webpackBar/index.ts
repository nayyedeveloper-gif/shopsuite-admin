const WebpackBar = require('webpackbar')
const { version } = require('../../../../package.json')

module.exports = {
  // Webpack 5 ProgressPlugin schema rejects webpackbar's legacy options; skip in local run.
  createWebpackBar: () => [],
}

