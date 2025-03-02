require 'rails_helper'

RSpec.describe Post, type: :model do
  it "タイトル、ユーザーIDあれば有効な状態であること" do
    user = User.create(
      name: "田中",
      email: "tester@example.com",
      password: "password",
      password_confirmation: "password"
    )
    post = Post.new(title: "tester", user_id: user.id)
    expect(post).to be_valid
  end
  
  it "タイトルがなければ無効な状態であること" do
    post = Post.new(title: "")
    post.valid?
    expect(post.errors[:title]).to include("can't be blank")
  end
  
  it "user_idがなければ無効な状態であること" do
    post = Post.new()
    post.valid?
    expect(post.errors[:user]).to include("must exist")
  end
  
  it "bodyの文字数が100文字以上であれば無効な状態であること" do
    post = Post.new(body: 'a' * 101)
    post.valid?
    expect(post.errors[:body]).to include("is too long (maximum is 100 characters)")
  end
end
