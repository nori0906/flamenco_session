require 'rails_helper'

RSpec.describe "Posts", type: :system, js: true do

  # ユーザーは投稿一覧画面遷移できる
  xscenario "user navigates to list of posts" do
    visit posts_path
    expect(page).to have_current_path(posts_path)
    expect(page).to have_text("投稿一覧")
  end

  # FIXME: recording専用のシステムスペックを作成したほうが良さそう 25/3/10
  # 録音を完了する
  xscenario "user Finish the recording" do
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    visit root_path
    within "#rspec-system-spec" do
      click_on "ログイン"
    end
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"

    visit new_post_path
    save_and_open_page
    click_on "REC"
    expect(page).to have_text "次へ"
  end

  # FIXME: マイク許可を通過する方法がわからないため保留 25/3/4
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
      # Capybara::ElementNotFound: Unable to find link or button "新規録音/投稿" 25/3/3 -> ログインできていない？
      click_on "新規録音/投稿"
      # JSによる操作が入るためクリックできずエラーが起きている 3/4
      # マイクの許可設定ができていない
      click_on "REC"
      click_on "STOP"
      within "#rspec-system-spec" do
        click_on "Play"
      end
      expect(page).to have_text "次へ"
      click_on "次へ"
      fill_in "タイトル", with: "Test Post"
      fill_in "内容", with: "Trying out Capybara"
      choose "公開"
      click_on "投稿する"

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
    post = user.posts.create(title: "tester post", status: "published", ext_type: "webm")
    post.voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')
    
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
    post = user.posts.create(
      title: "tester post",
      status: "published",
      ext_type: "webm"
      )
    post.voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')
    
    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # 投稿詳細画面に遷移
    visit edit_post_path(post.id)
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
  scenario "user views own post" do
    # 事前データを用意：user,post
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    post = user.posts.create(title: "Delete Post Tester", status: "published", ext_type: "webm")
    post.voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')

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
  scenario "user views own post" do
    
  end

  # ユーザーは他人の投稿を削除できない
  scenario "user views own post" do
    
  end
  

end
