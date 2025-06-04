require 'rails_helper'

RSpec.describe "UserSessions", type: :system do

  # ユーザーはログインできる
  scenario "user can login" do
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
    expect(page).to have_text "投稿一覧"
    expect(page).to have_text "ログインしました"
    expect(page).to have_current_path posts_path
  end
  

  # ユーザーはログアウトできる
  scenario "user can logout" do
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
    expect(page).to have_text "投稿一覧"
    expect(page).to have_text "ログインしました"
    expect(page).to have_current_path posts_path

    within ".offcanvas-body" do
      click_on "ログアウト"
    end
    expect(page).to have_text "ログイン"
    expect(page).to have_text "ログアウトしました"
    expect(page).to have_current_path login_path
  end
end
