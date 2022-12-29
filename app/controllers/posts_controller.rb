class PostsController < ApplicationController
  
  def index
    @posts = Post.published.order(created_at: :desc)
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
    if params[:ref_id]
      @ref_post = Post.find(params[:ref_id])
    end
    # クエリパラメータで取得した投稿データのさらに紐づいた投稿データを確認し取得
    if @ref_post.present? && @ref_post.collab_src #左から実行。present?で値の有無を確認し、エラーを防ぐ
      @root_post = Post.find(@ref_post.collab_src)
    end
  end
  
  def create
    voice_data = voice_params[:voice]
    
    File.open("tempfile.m4a", "wb") do |f|
      f.write(Base64.decode64(voice_data))
    end

    post = Post.new(title: "")
    # クエリパラメータのref_idに値があれば、collab_srcカラムにidを格納する
    post.collab_src = params[:ref_id] if params[:ref_id].present?

    post.voice.attach(io: File.open("tempfile.m4a"), filename: "newfile.m4a")
    if post.save!
      File.delete("tempfile.m4a")
      render json: { id: post.id }
    else
      # TODO: 後で実装する
    end
  end  

  def edit
    @post = Post.find(params[:id])
  end

  def update
    @post = Post.find(params[:id])
    if @post.update(post_params)
      redirect_to posts_path
    else
      render :edit
    end
  end
  
  def destroy
    post = Post.find(params[:id])
    post.destroy
    redirect_to posts_path, notice: "削除しました。"
  end

  def example
    
  end

  private

  def voice_params
    params.permit(:voice)
  end

  def post_params
    params.require(:post).permit(:title, :body, :status)
  end
end
