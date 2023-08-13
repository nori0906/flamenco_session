class ProfilesController < ApplicationController
  before_action :set_user, only: %i[show edit update]

  def show
    # ブラウザによって対応しているMIMEが異なるため、ブラウザに対応する投稿一覧を取得 要見直し23/8/7
    browser = request.browser
    if browser == "Chrome" || browser == "Edge"
      user_posts = @user.posts.where(ext_type: "webm")
    elsif browser == "Safari"
      user_posts = @user.posts.where(ext_type: "m4a")
    end
    
    respond_to do |format|
      format.html {
        @published_posts = user_posts.published.order(created_at: :desc)
      }
      format.js {
        @published_posts = user_posts.published.order(created_at: :desc) if params[:type] == "published"
        @unpublished_posts = user_posts.unpublished.order(created_at: :desc) if params[:type] == "unpublished"
      }
    end
  end

  def edit; end

  def update
    if @user.update(user_params)
      redirect_to profile_path, flash: {success: "ユーザー情報を更新しました"}
    else
      flash.now[:danger] = @user.errors.full_messages.to_sentence
      render :edit
    end

  end

  private

  def set_user
    @user = User.find(current_user.id)
  end

  def user_params
    params.require(:user).permit(:email, :name, :avatar, :avatar_cache)
  end

end
