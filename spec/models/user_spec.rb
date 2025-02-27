require 'rails_helper'

RSpec.describe User, type: :model do
  # 名前、メール、パスワードがあれば有効な状態であること
  it "is valid with a name, email, and password"

  # 名前がなければ無効な状態であること
  it "is invalid without a name"

  # メールアドレスがなければ無効な状態であること
  it "is invalid without a email address"

  # メールアドレスが重複していれば無効な状態であること
  it "is invalid with a duplicate email address"

  # パスワードがなければ無効な状態であること
  it "is invalid without a password"

  # パスワードの長さが3文字以上でなければ無効な状態であること
  it "it is invalid without a password length for at least 3 characters"

  # 確認パスワードがなければ無効な状態であること
  it "is invalid without a confirmation password"

  # パスワードと確認パスワードが一致しなければ無効な状態であること
  it "is invalid without a password and confirmation password match."
end
