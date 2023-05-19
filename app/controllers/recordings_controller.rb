class RecordingsController < ApplicationController

  def new
    @post = Post.new
    # 「ref_id」 クエリパラメータの値があるかを確認し、idがあればその投稿データを取得
    if params[:ref_id]
      @ref_post = Post.find(params[:ref_id])
    end
    # クエリパラメータで取得した投稿データのさらに紐づいた投稿データを確認し取得
    if @ref_post.present? && @ref_post.collab_src #左から実行。present?で値の有無を確認し、エラーを防ぐ
      @root_post = Post.find(@ref_post.collab_src)
    end
  end
  
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
