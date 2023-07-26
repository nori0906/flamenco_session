class Post < ApplicationRecord
  has_one_attached :voice
  belongs_to :user
  # 投稿とコラボ投稿の関連（自己結合）
  ## コラボ元投稿から、コラボ投稿群を参照
  has_many :collab_posts, class_name: "Post", foreign_key: "collab_src"
  ## コラボ投稿から、元となる投稿を参照
  belongs_to :base_post, class_name: "Post", optional: true, foreign_key: "collab_src"

  validates :title, presence: true, on: :update
  validates :body, length: { maximum: 100 }
  validates :collab_src, numericality: true, if: :collab_src?


  enum status: { draft: 0, published: 1 }
end
