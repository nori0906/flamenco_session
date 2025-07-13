require 'rails_helper'

RSpec.describe "Recordings", type: :request do
  let(:audio_path) { Rails.root.join("spec/fixtures/files/test_silent.webm") }

  before do
    FfmpegHelper.generate_silent_webm(path: audio_path.to_s) unless FfmpegHelper.fixture_exists?(audio_path)
    # ユーザーをデータベースに登録
    @user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    post login_path, params: { email: @user.email, password: 'password' } # `visit`使えなかった
  end
  after do
    FfmpegHelper.fixture_delete?(audio_path)
  end



  ### テスト ###
  ## 前提処理
  xdescribe "ログインを確認" do
    it "ログイン済みであること" do
      expect(response.body).to include('ログインしました') # どういうロジックで確認するのが良いかわからなかった
    end
  end

  xdescribe "FfmpegHelperの動作確認" do
    it "音声ファイルが存在すること" do
      expect(FfmpegHelper.fixture_exists?(audio_path)).to eq true
    end
  end


  ### メインテスト
  ## 正常系
  xdescribe "return 200" do
    it "when audio_file" do
      # リクエスト：`fixture_file_upload`で音声ファイルをアップロード
      audio_file = fixture_file_upload(audio_path, 'audio/webm')
      # データとタイプを設定しサーバーへ送信
      post recordings_path, params: {
        recording: {
          voice: audio_file
        }
      }, headers: {
        "CONTENT_TYPE" => "multipart/form-data"
      }
      # レスポンス：`expect(response).to have_http_status(:ok)`で検証
      expect(response).to have_http_status(200)
    end
  end


  ## 異常系
  describe "return 422" do
    it "when voice nil" do
      post recordings_path, params: {
        recording: {
          voice: nil
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
