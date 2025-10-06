require 'rails_helper'

RSpec.describe "guest_tutorial/how_to_recordings#index", type: :request do
  subject(:request_call) {
    # 値がnilならパラメータなしでリクエスト
    path = guest_tutorial_how_to_recordings_path
    params.nil? ? get(path) : get(path, params: params)
  }
  describe 'GET /guest_tutorial/how_to_recordings' do
    context "有効なlevelの場合" do
      shared_examples "有効なレベルの結果" do |level_val|
        let(:params) { { level: level_val } }
        it %(値:「#{level_val}」/ OK & data-level) do
          request_call
          expect(response).to have_http_status(:ok)
          expect(response.body).to include(%(data-level="#{level_val}"))
        end
      end
      %w[easy normal hard].each { |level_val| it_behaves_like "有効なレベルの結果", level_val }
    end
    
    context "無効なlevelの場合" do
      # 無効値を用意
      INVALID_LEVEL = "super"
      shared_examples "無効なレベルの結果" do |level_val|
        let(:params) { {level: level_val } }
        it %(値:「#{level_val.inspect}」/ 302 & redirect[introductions#index]) do
          request_call
          expect(response).to have_http_status(:found)
          expect(response).to redirect_to(guest_tutorial_introductions_path)
          
          # # json検証が必要な場合（how_to_recordings_controller#index）
          # expect(response).to have_http_status(:not_found)
          # if level_val.blank?
          #   expect(response.body).to include("error", "値がありません")
          # else
          #   expect(response.body).to include("error", "値が正しくありません")
          # end
        end
      end
      [nil, "", INVALID_LEVEL].each { |level_val| it_behaves_like "無効なレベルの結果", level_val }
    end
  end
end
