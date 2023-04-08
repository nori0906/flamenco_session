class Post < ApplicationRecord
  has_one_attached :voice

  validates :title, presence: true, on: :update
  validates :body, length: { maximum: 100 }
  validates :collab_src, numericality: true, if: :collab_src?


  enum status: { draft: 0, published: 1 }
end
