# Load existing data from backup.json and import into Rails database
# Usage: rails runner db/seeds.rb

require 'json'

backup_file = Rails.root.join('backup.json')

if File.exist?(backup_file)
  puts "Loading data from backup.json..."
  
  data = JSON.parse(File.read(backup_file))
  
  # Import persons
  if data['persons']
    puts "Importing #{data['persons'].length} persons..."
    data['persons'].each do |person_data|
      Person.create!(
        id: person_data['id'],
        name: person_data['name'],
        gender: person_data['gender'],
        birth_date: person_data['birth_date'],
        death_date: person_data['death_date'],
        is_adopted: person_data['is_adopted'] || false,
        notes: person_data['notes']
      )
    end
    puts "✓ Imported #{Person.count} persons"
  end
  
  # Import relationships
  if data['relationships']
    puts "Importing #{data['relationships'].length} relationships..."
    data['relationships'].each do |rel_data|
      # Map 'type' to 'relationship_type'
      Relationship.create!(
        id: rel_data['id'],
        person1_id: rel_data['person1_id'],
        person2_id: rel_data['person2_id'],
        relationship_type: rel_data['type'] || rel_data['relationship_type']
      )
    end
    puts "✓ Imported #{Relationship.count} relationships"
  end
  
  puts "Data import complete!"
else
  puts "No backup.json file found. Creating sample data..."
  
  # Create sample data
  person1 = Person.create!(name: "太郎", gender: "男性", birth_date: "1950")
  person2 = Person.create!(name: "花子", gender: "女性", birth_date: "1952")
  person3 = Person.create!(name: "一郎", gender: "男性", birth_date: "1975")
  
  Relationship.create!(person1_id: person1.id, person2_id: person2.id, relationship_type: "spouse")
  Relationship.create!(person1_id: person1.id, person2_id: person3.id, relationship_type: "parent_child")
  
  puts "✓ Created sample data"
end
