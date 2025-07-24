class RecordingsController < ApplicationController

  # サーバーへ送られた録音データを一時保存し、blob Idをクライアントへ返す
  def create
    # voiceの存在判定
    if audio_params[:voice].blank?
      render json: { error: "ファイルが空です" }, status: :unprocessable_entity and return
    end

    # 許可するMIMEを定義
    ## safariでもwebmが再生できるようになったためwebmのみ指定 25/7/23
    ## FIXME: その他の関連ファイルも修正する
    permitted_mime_types =  ["audio/webm"]
    # Content-TypeのMIMEを取得
    content_type = audio_params[:voice].content_type
    tempfile = audio_params[:voice].tempfile
    filename = audio_params[:voice].original_filename
    # バイナリのMIMEを取得
    mime_type = Marcel::MimeType.for(tempfile, name: filename)


    # MIMEが有効かを判定し、真の場合にblobを作成
    if permitted_mime_types.include?(content_type) && permitted_mime_types.include?(mime_type)
      # attachの場合、データベースへ保存されないとblobを参照できないため、直接blobを作成
      blob = ActiveStorage::Blob.create_after_upload!(
        io: audio_params[:voice].open,
        filename: filename,
        content_type: content_type
      )
      blob_url = rails_blob_path(blob)

      # 保存済みかのチェック
      # TODO: 条件がfalseの際の、エラー表示についての確認が必要 23/12/4
      if blob.persisted?
        # クライアントへblob Idを渡す
        render json: { id: blob.signed_id, blob_url: blob_url}
      else
        render json: { error: 'Failed to create blob' }, status: 500
      end
    else
      # ステータス415
      render json: { error: 'Unsupported MIME type' }, status: :unsupported_media_type
    end
  rescue => e
    render json: { error: e.message }, status: 500
  end

  private

  def audio_params
    params.require(:recording).permit(:voice)
  end
end
