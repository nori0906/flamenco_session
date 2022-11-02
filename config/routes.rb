Rails.application.routes.draw do
  root to: 'posts#index'
  get 'posts/record', to: 'posts#record'
  
  resources :posts


  post 'blob', to: 'posts#blob'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
