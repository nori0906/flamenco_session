class AddExtTypeToPosts < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :ext_type, :string
  end
end
