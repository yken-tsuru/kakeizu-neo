Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Root route
  root "family_tree#index"

  # People routes
  resources :people
  
  # Relationships routes
  resources :relationships
  
  # Family tree visualization
  get "family_tree", to: "family_tree#index"
  
  # API routes for AJAX
  namespace :api do
    resources :people, only: [:index, :show, :create, :update, :destroy]
    resources :relationships, only: [:index, :show, :create, :destroy]
    get "family", to: "family#index"
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
