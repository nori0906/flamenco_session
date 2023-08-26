class UserSessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create]

  def new; end

  def create
    @user = login(params[:email], params[:password])

    if @user
      flash[:success] = "Logged in successfully"
      redirect_back_or_to(posts_path)
    else
      flash.now[:danger] = 'Login failed'
      render action: 'new'
    end
  end

  def destroy
    logout
    redirect_to(login_path, flash: {primary: 'Logged out!'})
  end
end
