const { environment } = require('@rails/webpacker')

// 23/10/4 webpack5系に変更に伴いコードを追加
const customConfig = {
  resolve: {
    fallback: {
      dgram: false,
      fs: false,
      net: false,
      tls: false,
      child_process: false
    }
  }
};

environment.config.delete('node.dgram')
environment.config.delete('node.fs')
environment.config.delete('node.net')
environment.config.delete('node.tls')
environment.config.delete('node.child_process')

environment.config.merge(customConfig);
// ここまで


module.exports = environment

// プレビュー画像用にjqueryを使用できるように編集 23/4/6（参考： https://techtechmedia.com/jquery-webpacker-rails/）
const webpack = require('webpack')
environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
      $: 'jquery/src/jquery',
      jQuery: 'jquery/src/jquery'
  })
)