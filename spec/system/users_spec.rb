require 'rails_helper'

RSpec.describe "Users", type: :system do

  # ユーザーはアカウントの新規作成をする
  scenario "user create a new user account" do
    visit login_path
    click_on "ユーザー登録がまだの方"
    fill_in "名前", with: "田中"
    fill_in "メールアドレス", with: "tester@example.com"
    fill_in "パスワード", with: "password"
    fill_in "パスワード確認", with: "password"
    click_on "登録"
    
    expect(page).to have_text "ログイン"
    expect(page).to have_text "登録しました"
    expect(page).to have_current_path login_path
    
    fill_in "メールアドレス", with: "tester@example.com"
    fill_in "パスワード", with: "password"
    click_on "ログイン"

    expect(page).to have_text "投稿一覧"
    expect(page).to have_current_path posts_path
  end
end
