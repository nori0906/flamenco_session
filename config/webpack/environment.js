const { environment } = require('@rails/webpacker')

module.exports = environment

// プレビュー画像用にjqueryを使用できるように編集 23/4/6（参考： https://techtechmedia.com/jquery-webpacker-rails/）
const webpack = require('webpack')
environment.plugins.prepend('Provide',
    new webpack.ProvidePlugin({
        $: 'jquery/src/jquery',
        jQuery: 'jquery/src/jquery'
    })
)