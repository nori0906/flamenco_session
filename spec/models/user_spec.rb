require 'rails_helper'

RSpec.describe User, type: :model do
  # 名前、メール、パスワード、確認パスワードがあれば有効な状態であること
  it "is valid with a name, email, and password" do
    user = User.new(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    expect(user).to be_valid
  end

  # 名前がなければ無効な状態であること
  it "is invalid without a name" do
    user = User.new(name: nil)
    user.valid?
    expect(user.errors[:name]).to include("can't be blank")
  end

  # メールアドレスがなければ無効な状態であること
  it "is invalid without a email address" do
    user = User.new(email: nil)
    user.valid?
    expect(user.errors[:email]).to include("can't be blank")
  end

  # 確認パスワードがなければ無効な状態であること
  it "is invalid without a confirmation password" do
    user = User.new(password_confirmation: nil)
    user.valid?
    expect(user.errors[:password_confirmation]).to include("can't be blank")
  end

  # メールアドレスが重複していれば無効な状態であること
  it "is invalid with a duplicate email address" do
    User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    user = User.new(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    user.valid?
    expect(user.errors[:email]).to include("has already been taken")
  end

  # パスワードの長さが3文字以上でなければ無効な状態であること
  it "it is invalid without a password length for at least 3 characters" do
    user = User.new(password: "aa")
    user.valid?
    expect(user.errors[:password]).to include("is too short (minimum is 3 characters)")
  end


  # パスワードと確認パスワードが一致しなければ無効な状態であること
  it "is invalid without a password and confirmation password match." do
    user = User.new(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "hogehogehoge"
    )
    user.valid?
    expect(user.errors[:password_confirmation]).to include("doesn't match Password")
  end
end
