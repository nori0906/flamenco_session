require 'rails_helper'

RSpec.describe "guest_tutorial/how_to_recordings#index", type: :request do
  describe 'GET /guest_tutorial/how_to_recordings, params: {level: "easy"} (初級ボタン)' do
    # 正常系
    context "有効なlevelの場合" do
      it "ステータス200 & レベル別テキストが返る" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "easy"
        }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('data-level="easy"')
      end
    end

    # 異常系：
    context "無効なlevelの場合" do
      it "未指定(nil)だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: nil
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "未指定("")だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: ""
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "無効値だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "super"
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値が正しくありません")
      end
    end
  end


  describe 'GET /guest_tutorial/how_to_recordings, params: {level: "normal"} （中級ボタン）' do
    # 正常系
    context "有効なlevelの場合" do
      it "ステータス200 & レベル別テキストが返る" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "normal"
        }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('data-level="normal"')
      end
    end

    # 異常系：
    context "無効なlevelの場合" do
      it "未指定(nil)だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: nil
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "未指定("")だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: ""
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "無効値だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "super"
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値が正しくありません")
      end
    end
  end


  describe 'GET /guest_tutorial/how_to_recordings, params: {level: "hard"} （上級ボタン）' do
    # 正常系
    context "有効なlevelの場合" do
      it "ステータス200 & レベル別テキストが返る" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "hard"
        }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include('data-level="hard"')
      end
    end

    # 異常系：
    context "無効なlevelの場合" do
      it "未指定(nil)だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: nil
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "未指定("")だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: ""
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値がありません")
      end
      it "無効値だと302で前ページ（introductions#index）にリダイレクト" do
        get guest_tutorial_how_to_recordings_path, params: {
          level: "super"
        }
        expect(response).to have_http_status(:found)
        expect(response).to redirect_to(guest_tutorial_introductions_path)
        # json検証用
        # expect(response).to have_http_status(:not_found)
        # expect(response.body).to include("error", "値が正しくありません")
      end
    end
  end

end
