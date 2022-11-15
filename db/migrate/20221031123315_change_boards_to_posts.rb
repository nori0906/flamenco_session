class ChangeBoardsToPosts < ActiveRecord::Migration[6.1]
  def change
    rename_table :boards, :posts
  end
end
