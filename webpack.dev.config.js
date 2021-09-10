const webpack = require('webpack');
const path = require('path');
//引入合并模块
const {merge} = require('webpack-merge');
//引入提取出重复配置的通用模块
const commonConfig = require('./webpack.common.config');

 const devConfig = {
  //指定项目的模式 production:生产环境 development:开发环境
  mode: 'development',
  devtool: "source-map",
  entry: {
    'mcp_doc_lesson': path.resolve(__dirname, 'lesson3/web/index.js')
  },
  output: {
    filename: `[name].dev.js`,
  }

}

//合并通用环境和开发环境
module.exports = merge(commonConfig, devConfig);