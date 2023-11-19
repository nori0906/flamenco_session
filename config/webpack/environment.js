const { environment } = require('@rails/webpacker')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// 環境に応じてローダーを切り替える
const styleLoader = process.env.RAILS_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader';

environment.loaders.append('sass', {
  test: /\.scss$/,
  use: [
    styleLoader, // 開発時は 'style-loader', 本番時は MiniCssExtractPlugin.loader
    'css-loader',
    'sass-loader'
  ]
})


// 本番環境の場合のみプラグインを追加
if (process.env.RAILS_ENV === 'production') {
  environment.plugins.append(
    'MiniCssExtract',
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css'
    })
  )
}

// 画像ファイル用のローダー設定
environment.loaders.append('file', {
  test: /\.(jpg|jpeg|png|gif|tiff|ico|svg|eot|otf|ttf|woff|woff2)$/i,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name]-[hash].[ext]',
        outputPath: 'media/images',
        publicPath: '/packs/media/images'
      }
    }
  ]
})

module.exports = environment
