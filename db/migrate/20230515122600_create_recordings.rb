class CreateRecordings < ActiveRecord::Migration[6.1]
  def change
    create_table :recordings do |t|

      t.timestamps
    end
  end
end
