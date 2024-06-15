class GuestTutorial::HowToRecordingsController < ApplicationController
  skip_before_action :require_login
  def index
    if params[:level]
      @level = params[:level]
    else
      redirect_to guest_tutorial_introductions_path
    end

  end

  private
  def how_to_rec_params
    params.require(:how_to_recordings).permit(:level)
  end

end
