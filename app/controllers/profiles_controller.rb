class ProfilesController < ApplicationController
  skip_before_action :require_login
  skip_before_action :set_user, only %i[edit update]

  def show; end

  def edit; end

  def update

  end

  private

  def set_user

  end

  def user_params

  end

end
