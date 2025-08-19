require 'rails_helper'

RSpec.describe "Profiles", type: :request do

  # 前提条件など記載
  before do
    # ユーザーをデータベースに登録
    @user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    @post_pub = @user.posts.create(title: "A", status: "published", )
    @post_unpub = @user.posts.create(title: "B", status: "unpublished")
    posts = [@post_pub, @post_unpub]

    ## オブジェクト作成後にアタッチして音声データを追加（修正しやすさを考慮）
    posts.each do |post|
      post.voice.attach(
        io: File.open(Rails.root.join("spec/fixtures/files/dummy.webm")),
        filename: "dummy.webm",
        content_type: "audio/webm"
        )
      end

     ## オブジェクト作成時に音声データを追加
     # @post_pub = @user.posts.create(
     #   title: "A",
     #   status: "published",
     #   voice: fixture_file_upload(Rails.root.join("spec/fixtures/files/dummy.webm"), "audio/webm")
     # )
     # @post_unpub = @user.posts.create(
     #   title: "B",
     #   status: "unpublished",
     #   voice: fixture_file_upload(Rails.root.join("spec/fixtures/files/dummy.webm"), "audio/webm")
     # )


      post login_path, params: { email: @user.email, password: 'password' }
    end
    

  xdescribe "投稿確認" do
    it "公開投稿が存在すること" do
      get profile_path
      expect(response.body).to include("A")
    end
  end

  describe "投稿一覧の表示切り替え(公開・非公開)" do
    context "published（公開）をリクエストした場合" do
      it "@published_postsが返る" do
        get profile_path(format: :js, type: 'published'), headers: { 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest' }
        ## ステータスチェック
        expect(response).to have_http_status(:ok)
        ## 形式チェック
        expect(response.media_type).to include('javascript')
        expect(response.body).to include("isActive('published', 'unpublished');")
        expect(response.body).to include("$('#select_posts').html('")
      end
    end
    context "unpublished（非公開）をリクエストした場合" do
      it "@unpublished_postsが返る" do
        get profile_path(format: :js, type: 'unpublished'), headers: { 'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest' }
        expect(response).to have_http_status(:ok)
        expect(response.body).to include("isActive('unpublished', 'published');")
        expect(response.body).to include("$('#select_posts').html('")
      end
    end
  end
end
