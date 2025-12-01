class CreateRelationships < ActiveRecord::Migration[7.1]
  def change
    create_table :relationships do |t|
      t.integer :person1_id, null: false
      t.integer :person2_id, null: false
      t.string :relationship_type, null: false

      t.timestamps
    end
    
    add_foreign_key :relationships, :people, column: :person1_id
    add_foreign_key :relationships, :people, column: :person2_id
    add_index :relationships, :person1_id
    add_index :relationships, :person2_id
    add_index :relationships, :relationship_type
  end
end
