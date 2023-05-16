class RecordingsController < ApplicationController
  
  def create
    # create new (unsaved) recording
    @recording = Recording.new
    @recording.voice.attach(voice_params[:voice])

    if @recording.voice.attached?
      render json: { id: @recording.voice.blob.id }
    else
      # handle error...
    end
  end

  private

  def voice_params
    params.requuire(:recording).permit(:voice)
  end
end
