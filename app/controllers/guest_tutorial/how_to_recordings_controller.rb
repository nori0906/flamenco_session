class GuestTutorial::HowToRecordingsController < ApplicationController
  skip_before_action :require_login
  def index
    @level = params[:level]
  end

end
