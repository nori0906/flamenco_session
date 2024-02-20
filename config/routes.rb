Rails.application.routes.draw do
  root to: 'static_pages#top'

  get 'login', to: 'user_sessions#new'
  post 'login', to: "user_sessions#create"
  delete 'logout', to: 'user_sessions#destroy'


  namespace :guest_tutorial, path: "tutorial" do
    resources :introductions, only: %i[index]
  end
  namespace :guest_tutorial, path: "tutorial" do
    resources :how_to_recordings, only: %i[index]
  end

  # ゲスト投稿閲覧についての設定
  scope :guest do
    resources :posts, only: %i[index show], as: :guest
  end

  resources :posts
  resources :recordings, only: %i[new create]
  resources :users, only: %i[new create]
  resource :profile, only: %i[show edit update]
  resources :password_resets, only: %i[new create edit update]

  # letter_opener_webにアクセスするためのルーティング設定
  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
