class PostsController < ApplicationController
  # 実際の使用するコード
  before_action :require_login, except: %i[index show]

  # 一時利用
  # skip_before_action :require_login

  def index
    browser = request.browser
    if browser == "Chrome" || browser == "Edge"
      @posts = Post.published.where(ext_type: "webm").order(created_at: :desc)
    elsif browser == "Safari"
      @posts = Post.published.where(ext_type: "m4a").order(created_at: :desc)
    end
  end

  def show
    @post = Post.find(params[:id])
    # 元音源のデータ取得
    if @post.collab_src
      @ref_post = Post.find_by(id: @post.collab_src)
    end
    # 大元音源のデータ取得
    if @ref_post.present? && @ref_post.collab_src
      @root_post = Post.find(@ref_post.collab_src)
    end
  end

  def new
    @post = Post.new
    # 「ref_id」 クエリパラメータの値があるかを確認し、idがあればその投稿データを取得
    # if params[:ref_id]
    #   @ref_post = Post.find(params[:ref_id])
    # end
    # # クエリパラメータで取得した投稿データのさらに紐づいた投稿データを確認し取得
    # if @ref_post.present? && @ref_post.collab_src #左から実行。present?で値の有無を確認し、エラーを防ぐ
    #   @root_post = Post.find(@ref_post.collab_src)
    # end
  end


  def create
    @post = Post.new(
      title: post_params[:title],
      body: post_params[:body],
      status: post_params[:status]
    )
    
    # Blob IDから録音データを取得
    voice_blob = ActiveStorage::Blob.find_signed!(post_params[:voice_blob_id])

    # Postに録音データをアタッチ
    @post.voice.attach(voice_blob)
    
    #MMIMEタイプ（サブタイプ名）をPostに格納
    mime_type = @post.voice.content_type
    mime_subtype = mime_type.split("/").last
    @post.ext_type = mime_subtype


    if @post.save
      # 成功したときの処理
      redirect_to posts_path, flash: {success: "投稿しました"}
    else
      # 失敗したときの処理
      flash.now[:danger] = @post.errors.full_messages.to_sentence
      render :new
    end
  end


  def edit
    @post = Post.find(params[:id])
  end

  def update
    @post = Post.find(params[:id])
    if @post.update(post_params)
      redirect_to posts_path, flash: {success: "編集しました"}
    else
      flash.now[:danger] = @post.errors.full_messages.to_sentence
      render :edit
    end
  end

  def destroy
    post = Post.find(params[:id])
    post.destroy
    redirect_to posts_path, flash: {danger: "削除しました。"}
  end

  private


  def post_params
    # 「:voice_blob_id」は仮属性として一時的に使用している
    params.require(:post).permit(:title, :body, :status, :ext_type, :voice_blob_id)
  end
end
