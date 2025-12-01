class CreatePeople < ActiveRecord::Migration[7.1]
  def change
    create_table :people do |t|
      t.string :name, null: false
      t.string :gender
      t.string :birth_date
      t.string :death_date
      t.boolean :is_adopted, default: false
      t.text :notes

      t.timestamps
    end
    
    add_index :people, :name
  end
end
