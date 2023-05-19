class RecordingsController < ApplicationController

  def create
    # attachだとモデルのデータベースへの保存されないとblobを参照できないため、直接blobを作成しidを使用
    blob = ActiveStorage::Blob.create_after_upload!(
      io: voice_params[:voice].open,
      filename: voice_params[:voice].original_filename,
      content_type: voice_params[:voice].content_type
    )

    if blob.persisted?
      render json: { id: blob.id }
    else
      render json: { error: 'Failed to create blob' }, status: 500
    end
  rescue => e
    render json: { error: e.message }, status: 500
  end

  private

  def voice_params
    params.require(:recording).permit(:voice, :ext)
  end
end
