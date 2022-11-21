class Post < ApplicationRecord
  has_one_attached :voice

  validates :title, presence: true, on: :update
  validates :collab_src, numericality: true, if: :collab_src? 


end
