require 'rails_helper'

### 初期化 ###
RSpec.describe "Recordings#create", type: :request do
  # 正常系ダミーファイル
  let(:audio_path) { Rails.root.join("spec/fixtures/files/test_silent.webm") } # ルートパス取得
  let(:audio_file) { fixture_file_upload(audio_path, 'audio/webm')} # ファイルアップロード
  
  # 異常系ダミーファイル
  let(:dummy_txt_path) { Rails.root.join("spec/fixtures/files/dummy.txt") }
  let(:dummy_jpg_path) { Rails.root.join("spec/fixtures/files/dummy.jpg") }
  let(:dummy_mp4_path) { Rails.root.join("spec/fixtures/files/dummy.mp4") }
  let(:dummy_mp3_path) { Rails.root.join("spec/fixtures/files/dummy.mp3") }
  let(:dummy_txt_file) { fixture_file_upload(dummy_txt_path, 'text/plain')}
  let(:dummy_jpg_file) { fixture_file_upload(dummy_jpg_path, 'image/jpg')}
  let(:dummy_mp4_file) { fixture_file_upload(dummy_mp4_path, 'video/mp4')}
  let(:dummy_mp3_file) { fixture_file_upload(dummy_mp3_path, 'audio/mpeg')}
  let(:dummy_not_webm_file) { fixture_file_upload(dummy_mp3_path, 'audio/webm')} # MIME指定が異なる場合

  before do
    # 音声を生成
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
  ## 前提確認 ##
  xdescribe "認証を確認" do
    xit "ログイン済み" do
      puts "# session結果： #{flash[:success]}"
      expect(flash[:success]).to eq "ログインしました"
      # expect(session[:user_id]).to_not be_nil   ## sessionの直接参照は非推奨
      # expect(session["flash"]["flashes"]).to include("success" => "ログインしました")   ## sessionの直接参照は非推奨
      # expect(response).to redirect_to user_path(@user)   ## user_path 使えない
    end
    it "ログアウト済み" do
      delete logout_path
      puts "# session結果： #{flash[:primary]}"
      expect(flash[:primary]).to eq "ログアウトしました"
      # expect(session[:user_id]).to be_nil
      # expect(session["flash"]["flashes"]).to include("primary" => "ログアウトしました")
      # expect(response).to redirect_to user_path(@user)
    end
  end

  xdescribe "FfmpegHelperの動作確認" do
    it "音声ファイルが存在すること" do
      expect(FfmpegHelper.fixture_exists?(audio_path)).to eq true
    end
  end


  ## メイン ##
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

  ### it "Returns status 415 if content_type is other than audio/webm
  describe "Content_Typeが正しくない場合" do
    it "415ステータスを返す(txt/pain)" do
      post recordings_path, params: {
        recording: {
          voice: dummy_txt_file
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
        }
        expect(response).to have_http_status(:unsupported_media_type)
    end
    it "415ステータスを返す(image/jpg)" do
      post recordings_path, params: {
        recording: {
          voice: dummy_jpg_file
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
        }
        expect(response).to have_http_status(:unsupported_media_type)
    end
    it "415ステータスを返す(video/mp4)" do
      post recordings_path, params: {
        recording: {
          voice: dummy_mp4_file
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
        }
        expect(response).to have_http_status(:unsupported_media_type)
    end
    it "415ステータスを返す(audio/mp3)" do
      post recordings_path, params: {
        recording: {
          voice: dummy_mp3_file
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
        }
        expect(response).to have_http_status(:unsupported_media_type)
    end
    it "415ステータスを返す(バイナリはmp3だがaudio/webm指定)" do
      post recordings_path, params: {
        recording: {
          voice: dummy_not_webm_file
        }
        },headers: {
          "CONTENT_TYPE" => "multipart/form-data"
        }
        expect(response).to have_http_status(:unsupported_media_type)
    end
  end



  ## 認証系
  xdescribe "未ログイン時に音声データが渡された場合" do
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
