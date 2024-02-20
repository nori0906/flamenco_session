require 'carrierwave/storage/abstract'
require 'carrierwave/storage/file'
require 'carrierwave/storage/fog'

CarrierWave.configure do |config|
    config.storage :fog
    config.fog_provider = 'fog/aws'
    config.fog_directory  = 'fla-app-240120'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: ENV['ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['SECRET_ACCESS_KEY'],

      # FIXME: ローカル時のproduction設定
      # aws_access_key_id:  Rails.application.credentials.dig(:aws, :access_key_id),
      # aws_secret_access_key: Rails.application.credentials.dig(:aws, :secret_access_key),

      region: 'ap-northeast-1',
      path_style: true
    }
end