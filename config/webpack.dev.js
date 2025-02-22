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
        "target": "http://localhost:9090", //修改这里，指向你的 MindMark 服务端接口
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
      }
    },
  },
});
