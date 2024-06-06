class UserSessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]

  def new; end

  def create
    @user = login(params[:email], params[:password])

    if @user
      flash[:success] = "ログインしました"
      redirect_back_or_to(posts_path)
    else
      flash.now[:danger] = "ログインできません"
      render action: 'new'
    end
  end

  def destroy
    logout
    redirect_to(login_path, flash: {primary: "ログアウトしました"})
  end
end
