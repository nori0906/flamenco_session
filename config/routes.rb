Rails.application.routes.draw do
  root to: 'user_sessions#new'
  
  get 'login', to: 'user_sessions#new'
  post 'login', to: "user_sessions#create"
  delete 'logout', to: 'user_sessions#destroy'
  
  resources :posts
  resources :users, only: %i[new create] 


  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
