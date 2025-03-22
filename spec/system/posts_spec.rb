require 'rails_helper'

RSpec.describe "Posts", type: :system, js: true do
  # CSRFトークンを使えるようにする（録音データをサーバーへ送信する際に使用するため）
  before do
    ActionController::Base.allow_forgery_protection = true
  end
  
  after do
    ActionController::Base.allow_forgery_protection = false
  end


  # CERFトークンの表示を確認する
  xscenario "check CSRF token" do
    visit root_path
    token = page.find("meta[name='csrf-token']", visible: false)[:content]
    puts "CSRFトークン: #{token}"
    expect(page).to have_selector("meta[name='csrf-token']", visible: false)
  end


  # ユーザーは投稿一覧画面遷移できる
  xscenario "user navigates to list of posts" do
    visit posts_path
    expect(page).to have_current_path(posts_path)
    expect(page).to have_text("投稿一覧")
  end


  # ユーザーは投稿内のメニュー(オフキャパス)を開くことができる
  xscenario "user opens the offcanvas in a post" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    # 投稿データを作成
    post = user.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )
    
    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # オフキャンパスを表示
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"

    # 各ボタンを確認
    expect(page).to have_selector(".offcanvas-bottom", text: "詳細")
    expect(page).to have_selector(".offcanvas-bottom", text: "編集")
    expect(page).to have_selector(".offcanvas-bottom", text: "削除")
  end


  # FIXME: マイク許可を通過する方法がわからないため保留 25/3/4 ->手動で対応 3/22
  # ユーザーは新しい投稿を作成できる
  xscenario "user creates a new post" do
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    visit login_path
    fill_in "メールアドレス", with: user.email
    # user.password だと認証機能によりハッシュ化したパスワードしか取得できない？ため直接記入
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    
    expect {
      # 録音ページへ遷移
      click_on "新規録音/投稿"
      expect(page).to have_text "RECORDING"
      expect(page).to have_current_path new_post_path
      puts "Current URL: #{page.current_url}"
      
      # 録音を実行
      click_on "REC"
      # FIXME: テスト実行時に一時的に止めてマイク許可を手動で行う
      binding.pry
      expect(page).to have_text "STOP"
      click_on "STOP"
      expect(page).to have_text "次へ"
      click_on "次へ"
      
      # 投稿フォーム
      expect(page).to have_text "投稿フォーム"
      fill_in "タイトル", with: "Test Post"
      fill_in "内容", with: "Trying out Capybara"
      choose "公開"
      click_on "投稿する"

      # 投稿できたかの確認
      expect(page).to have_text "投稿しました"
      expect(page).to have_text "Test Post"
      expect(page).to have_text "#{user.name}"
    }.to change(user.posts, :count).by(1)

  end


  # ユーザーは自身の投稿を閲覧できる
  xscenario "user views own post" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    post = user.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )
    
    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # オフキャンパスを表示
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"

    # 詳細ボタンをクリック
    click_on "詳細"
    expect(page).to have_text "投稿詳細"
    expect(page).to have_current_path post_path(post.id)
  end


  # ユーザーは自身の投稿を編集できる
  xscenario "user update own post" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    
    # 投稿データを用意
    post = user.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )

    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path

    # オフキャンパスを表示
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"
    expect(page).to have_selector(".offcanvas-bottom", text: "編集")
    
    # 編集画面に遷移
    click_on "編集"
    expect(page).to have_text "投稿編集"
    expect(page).to have_current_path edit_post_path(post.id)
    
    # 各項目を編集
    fill_in "タイトル", with: "Add title"
    fill_in "内容", with: "Add text"
    choose "非公開"
    click_on "更新する"
    expect(page).to have_text "更新しました"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path

    # プロフィール画面へ遷移
    visit profile_path
    expect(page).to have_text "プロフィール"
    expect(page).to have_current_path profile_path

    # # # 更新項目を確認
    click_on "非公開"
    # 非公開タブが有効になっているか
    expect(page).to have_selector("#js-unpublished.active")
    expect(page).not_to have_selector("#js-published.active")
    # 投稿データが更新されているか
    expect(page).to have_selector(".card-title", text: "Add title")
    expect(page).to have_selector(".card-body", text: "Add text")
  end


  # ユーザーは自身の投稿を削除できる
  xscenario "user delete own post" do
    # 事前データを用意
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    # 投稿データを用意
    post = user.posts.create(
      title: "Delete Post Tester",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )

    # 事前処理：ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    # 投稿データが用意されているか
    expect(page).to have_selector(".card-title", text: "Delete Post Tester")

    # 実行処理：
    # オフキャンパスを表示
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"
    # 削除ボタン・確認ダイアログをクリック
    click_on "削除"
    accept_alert
    
    # 確認： 投稿データが削除されているか
    expect(page).to have_selector(".alert-danger.show", text: "削除しました")
    expect(page).to_not have_selector(".card-title", text: "Delete Post Tester")
  end


  # ユーザーは他人の投稿を編集できない
  xscenario "user can't edit other users'posts" do
    # ユーザーデータを用意
    user1 = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    user2 = User.create(
      name: "山田",
      email: "tester2@example.com",
      password: "password",
      password_confirmation: "password"
    )
  
    # 投稿データを用意(user2)
    post = user2.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )

    # 事前処理：ログインする
    visit login_path
    fill_in "メールアドレス", with: user1.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path

    # 編集ボタンがないかを確認
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"
    expect(page).to_not have_selector(".offcanvas-bottom", text: "編集")
  end


  # ユーザーは他人の投稿を削除できない
  xscenario "user can't delete other users'posts" do
    # ユーザーデータを用意
    user1 = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    user2 = User.create(
      name: "山田",
      email: "tester2@example.com",
      password: "password",
      password_confirmation: "password"
    )
  
    # 投稿データを用意(user2)
    post = user2.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
    )
    post.voice.attach(
      io: File.open(Rails.root.join('public/test.mp3')),
      filename: 'test.mp3'
    )

    # 事前処理：ログインする
    visit login_path
    fill_in "メールアドレス", with: user1.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path

    # 編集ボタンがないかを確認
    find("button[data-bs-target='#offcanvasBottom#{post.id}']").click
    expect(page).to have_selector ".offcanvas-bottom.show"
    expect(page).to_not have_selector(".offcanvas-bottom", text: "削除")
  end

end
