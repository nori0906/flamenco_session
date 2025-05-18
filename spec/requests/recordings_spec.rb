require 'rails_helper'

RSpec.describe "Recordings", type: :request do
  let(:audio_path) { Rails.root.join("spec/fixtures/files/test_silent.webm") }

  before do
    FfmpegHelper.generate_silent_webm(path: audio_path.to_s) unless FfmpegHelper.fixture_exists?(audio_path)
  end

  after do
    FfmpegHelper.fixture_delete?(audio_path)
  end

  describe "FfmpegHelperの動作確認" do
    it "音声ファイルが存在すること" do
      expect(FfmpegHelper.fixture_exists?(audio_path)).to eq true
    end
  end
  
  xdescribe "GET /recordings" do
    it "works! (now write some real specs)" do
      get recordings_index_path
      expect(response).to have_http_status(200)
    end
  end
end
