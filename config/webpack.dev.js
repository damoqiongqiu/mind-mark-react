const commonConfig = require("./webpack.common");
const { merge } = require("webpack-merge");
const path = require('path');

/**
 * @author 大漠穷秋
 */
module.exports = merge(commonConfig, {
  cache: {
    type: "memory",
  },
  devServer: {
    static: path.resolve("./docs/"),//为了配合 github pages，这里的路径使用 docs ，不使用默认的 public
    historyApiFallback: true,
    compress: true,
    allowedHosts: 'all',
    open: true,
    port: 8091,
    proxy: {
      "/mind-mark": {
        "target": "http://172.16.0.11:9888",
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
      }
    },
  },
});
