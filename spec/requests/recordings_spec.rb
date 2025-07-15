require 'rails_helper'

### 初期化 ###
RSpec.describe "Recordings", type: :request do
  let(:audio_path) { Rails.root.join("spec/fixtures/files/test_silent.webm") }
  let(:audio_file) { fixture_file_upload(audio_path, 'audio/webm')} # 音声ファイルをアップロード

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
  ## 前提確認
  xdescribe "認証を確認" do
    it "ログイン済みであること" do
      expect(response.body).to include('ログインしました') # どういうロジックで確認するのが良いかわからなかった
    end

    it "ログアウト済みであること" do
      delete logout_path
      expect(response.body).to include('ログアウトしました') # どういうロジックで確認するのが良いかわからなかった
    end
  end

  xdescribe "FfmpegHelperの動作確認" do
    it "音声ファイルが存在すること" do
      expect(FfmpegHelper.fixture_exists?(audio_path)).to eq true
    end
  end


  ### メインテスト
  ## 正常系
  xdescribe "正常な音声データが渡された場合" do
    it "200ステータスが返る" do
      # データとタイプを設定しサーバーへ送信
      post recordings_path, params: {
        recording: {
          voice: audio_file
        }
      }, headers: {
        "CONTENT_TYPE" => "multipart/form-data"
      }
      # レスポンス
      expect(response).to have_http_status(:ok)
    end
  end


  ## 異常系
  xdescribe "音声データがnilで渡された場合" do
    it "422ステータスを返す" do
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


  ## 認証系
  describe "未ログイン時に音声データが渡された場合" do
    it "302ステータスを返す" do
      delete logout_path
      post recordings_path, params: {
        recording: {
          voice: audio_file
        }
      }, headers: {
        "CONTENT_TYPE" => "multipart/form-data"
      }
      # statusチェック
      puts "# status結果： #{response.status}"
      expect(response).to have_http_status(302)
      # expect(response).to have_http_status(:redirect)
    end

    it "ログイン画面にリダイレクトされる" do
      delete logout_path
      post recordings_path, params: {
        recording: {
          voice: audio_file
        }
      }, headers: {
        "CONTENT_TYPE" => "multipart/form-data"
      }
      # Location（リダイレクト先）チェック
      puts "# Location結果： #{response.headers['Location']}"
      expect(response).to redirect_to(login_path)
    end
  end


end
