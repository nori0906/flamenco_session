require 'rails_helper'

RSpec.describe "Profiles", type: :system, js: true do
 
  # ユーザーは名前を変更できる
  scenario "user can update their name" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # Myプロフィール画面へ遷移
    find("#dropdownMenuButton1").click
    expect(page).to have_selector ".dropdown-menu.show"
    click_on "Myプロフィール"
    expect(page).to have_text "プロフィール"
    expect(page).to have_current_path profile_path
    
    # Myプロフィール編集画面へ遷移
    click_on "編集する"
    expect(page).to have_text "プロフィール編集"
    expect(page).to have_current_path edit_profile_path

    # 名前を編集
    fill_in "名前", with: "太郎"
    click_on "更新"

    expect(page).to have_text "ユーザー情報を更新しました"
    expect(page).to have_current_path profile_path
    expect(page).to have_text "太郎"
  end
  
  
  # ユーザーはメールアドレスを変更できる
  scenario "user can update their email" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
  
    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # Myプロフィール画面へ遷移
    find("#dropdownMenuButton1").click
    expect(page).to have_selector ".dropdown-menu.show"
    click_on "Myプロフィール"
    expect(page).to have_text "プロフィール"
    expect(page).to have_current_path profile_path
    
    # Myプロフィール編集画面へ遷移
    click_on "編集する"
    expect(page).to have_text "プロフィール編集"
    expect(page).to have_current_path edit_profile_path
  
    # メールアドレスを編集
    fill_in "メールアドレス", with: "change@example.com"
    click_on "更新"
  
    expect(page).to have_text "ユーザー情報を更新しました"
    expect(page).to have_current_path profile_path
    expect(page).to have_text "change@example.com"
    
  end
  

  # ユーザーはプロフィール画像を変更できる
  scenario "user can update their profile image" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
  
    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # Myプロフィール画面へ遷移
    find("#dropdownMenuButton1").click
    expect(page).to have_selector ".dropdown-menu.show"
    click_on "Myプロフィール"
    expect(page).to have_text "プロフィール"
    expect(page).to have_current_path profile_path
    
    # Myプロフィール編集画面へ遷移
    click_on "編集する"
    expect(page).to have_text "プロフィール編集"
    expect(page).to have_current_path edit_profile_path
  
    # ファイルをアップロード
    attach_file "avatarImg", Rails.root.join("spec/fixtures/files/test-avatar.jpg")
    click_on "更新"
    
    expect(page).to have_text "ユーザー情報を更新しました"
    expect(page).to have_current_path profile_path
    expect(page).to have_selector "img[src*='test-avatar.jpg']"
  end

  
  # ユーザーは自身の投稿を確認できる
  scenario "user can see their own posts" do
    # ユーザーをデータベースに登録
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
      )

    # 投稿データを用意
    post_pub = user.posts.create(title: "published post", status: "published", ext_type: "webm")
    post_unpub = user.posts.create(title: "unpublished post", status: "unpublished", ext_type: "webm")
    post_pub.voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')
    post_unpub.voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')

    # ログインする
    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"
    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
    
    # Myプロフィール画面へ遷移
    find("#dropdownMenuButton1").click
    expect(page).to have_selector ".dropdown-menu.show"
    click_on "Myプロフィール"
    expect(page).to have_text "プロフィール"
    expect(page).to have_current_path profile_path
    
    # 公開・非公開投稿の切り替わりを確認
    expect(page).to have_selector("#js-published.active")
    expect(page).not_to have_selector("#js-unpublished.active")
    expect(page).to have_text "published post"
    expect(page).to have_selector(".card-title", text: "published post")
    
    click_on "非公開"
    expect(page).to have_selector("#js-unpublished.active")
    expect(page).not_to have_selector("#js-published.active")
    expect(page).to have_selector(".card-title", text: "unpublished post")
    
    click_on "公開"
    expect(page).to have_selector("#js-published.active")
    expect(page).not_to have_selector("#js-unpublished.active")
    expect(page).to have_selector(".card-title", text: "published post")
  end
end
