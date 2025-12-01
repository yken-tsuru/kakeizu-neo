class Person < ApplicationRecord
  # Associations
  has_many :relationships_as_person1, class_name: 'Relationship', foreign_key: 'person1_id', dependent: :destroy
  has_many :relationships_as_person2, class_name: 'Relationship', foreign_key: 'person2_id', dependent: :destroy
  
  # Validations
  validates :name, presence: true
  validates :gender, inclusion: { in: ['男性', '女性', nil, ''] }, allow_blank: true
  
  # Get all relationships for this person
  def all_relationships
    Relationship.where('person1_id = ? OR person2_id = ?', id, id)
  end
  
  # Get spouses
  def spouses
    spouse_rels = all_relationships.where(relationship_type: ['spouse', 'ex_spouse'])
    spouse_ids = spouse_rels.map { |r| r.person1_id == id ? r.person2_id : r.person1_id }
    Person.where(id: spouse_ids)
  end
  
  # Get children
  def children
    child_rels = Relationship.where(person1_id: id, relationship_type: 'parent_child')
    Person.where(id: child_rels.pluck(:person2_id))
  end
  
  # Get parents
  def parents
    parent_rels = Relationship.where(person2_id: id, relationship_type: 'parent_child')
    Person.where(id: parent_rels.pluck(:person1_id))
  end
end
