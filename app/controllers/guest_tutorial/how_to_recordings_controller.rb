class GuestTutorial::HowToRecordingsController < ApplicationController
  skip_before_action :require_login
  def index
    if params[:level]
      @level = params[:level]
    else
      redirect_to guest_tutorial_introductions_path
    end

  end

end
