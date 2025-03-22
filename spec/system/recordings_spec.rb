require 'rails_helper'

RSpec.describe "Recordings", type: :system, js: true do
  
  # 録音を完了する
  scenario "user finish recording" do
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )

    visit login_path
    fill_in "メールアドレス", with: user.email
    fill_in "パスワード", with: "password"
    click_on "ログイン"

    visit new_post_path
    puts "Current URL: #{page.current_url}"
    click_on "REC"
    # FIXME: テスト実行時に一時的に止めてマイク許可を手動で行う
    # binding.pry
    expect(page).to have_text "STOP"
    click_on "STOP"
    expect(page).to have_text "次へ"
  end
end
