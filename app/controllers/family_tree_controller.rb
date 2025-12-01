class FamilyTreeController < ApplicationController
  def index
    @people = Person.all
    @relationships = Relationship.all
    
    # Pass data to JavaScript for canvas rendering
    @family_data = {
      persons: @people.as_json,
      relationships: @relationships.as_json
    }
  end
end
