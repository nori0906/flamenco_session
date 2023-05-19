class RecordingsController < ApplicationController

  # サーバーへ送られた録音データを一時保存し、blob Idをクライアントへ返す
  def create
    # MIMEタイプを取得＆許可する値を定義
    mime_type = audio_params[:voice].content_type
    permitted_mime_types =  ["audio/webm", "audio/mp4"]

    # MIMEタイプのチェック：真の場合にblobを作成
    if permitted_mime_types.include?(mime_type)
      # attachだとモデルのデータベースへの保存されないとblobを参照できないため、直接blobを作成
      blob = ActiveStorage::Blob.create_after_upload!(
        io: audio_params[:voice].open,
        filename: audio_params[:voice].original_filename,
        content_type: audio_params[:voice].content_type
      )

      # 保存済みかのチェック
      if blob.persisted?
        # クライアントへblob Idを渡す
        render json: { id: blob.signed_id }
      else
        render json: { error: 'Failed to create blob' }, status: 500
      end
    else
      render json: { error: 'Unsupported MIME type' }, status: 415
    end
  rescue => e
    render json: { error: e.message }, status: 500
  end

  private

  def audio_params
    params.require(:recording).permit(:voice)
  end
end
