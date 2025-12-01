class RelationshipsController < ApplicationController
  before_action :set_relationship, only: [:show, :edit, :update, :destroy]
  before_action :load_people, only: [:new, :edit, :create, :update]

  def index
    @relationships = Relationship.all.includes(:person1, :person2)
  end

  def show
  end

  def new
    @relationship = Relationship.new
  end

  def edit
  end

  def create
    @relationship = Relationship.new(relationship_params)

    if @relationship.save
      redirect_to relationships_path, notice: '関係を作成しました。'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @relationship.update(relationship_params)
      redirect_to relationships_path, notice: '関係を更新しました。'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @relationship.destroy
    redirect_to relationships_url, notice: '関係を削除しました。'
  end

  private

  def set_relationship
    @relationship = Relationship.find(params[:id])
  end

  def load_people
    @people = Person.all.order(:name)
  end

  def relationship_params
    params.require(:relationship).permit(:person1_id, :person2_id, :relationship_type)
  end
end
