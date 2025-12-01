class Relationship < ApplicationRecord
  # Associations
  belongs_to :person1, class_name: 'Person'
  belongs_to :person2, class_name: 'Person'
  
  # Validations
  validates :person1_id, presence: true
  validates :person2_id, presence: true
  validates :relationship_type, presence: true, inclusion: { in: ['spouse', 'ex_spouse', 'parent_child'] }
  
  # Ensure person1 and person2 are different
  validate :different_persons
  
  private
  
  def different_persons
    if person1_id == person2_id
      errors.add(:person2_id, "must be different from person1")
    end
  end
end
