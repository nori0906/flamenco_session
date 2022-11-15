class PostsController < ApplicationController
  
  def index
    @posts = Post.all.order(created_at: :desc)
  end

  def new
    @post = Post.new
    @id = params[:ref_id]
    if @id
      @ref_post = Post.find(@id)
    end
    if @ref_post.present? && @ref_post.collab_src #左から実行。present?で値の有無を確認し、エラーを防ぐ
      @root_post = Post.find(@ref_post.collab_src)
    end
  end
  
  def create
    voice_data = voice_params[:voice]
    
    File.open("tempfile.webm", "wb") do |f|
      f.write(Base64.decode64(voice_data))
    end
    
    if params[:ref_id]
      @ref_post = Post.find(params[:ref_id])
      post = Post.new(title: "", collab_src: @ref_post.id)
    else
      post = Post.new(title: "")
    end
    post.voice.attach(io: File.open("tempfile.webm"), filename: "newfile.webm")
    if post.save
      File.delete("tempfile.webm")
      render json: { id: post.id }
    end
  end
  
  def show
    @post = Post.find(params[:id])
    if @post.collab_src
      @ref_post = Post.find_by(id: @post.collab_src)
    end
    if @ref_post.present? && @ref_post.collab_src
      @root_post = Post.find(@ref_post.collab_src)
    end
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
    post = Post.find(params[:id])
    post.update(post_params)
    redirect_to posts_path
  end
  
  def destroy
    post = Post.find(params[:id])
    post.destroy
    redirect_to posts_path, notice: "削除しました。"
  end

  private

  def voice_params
    params.permit(:voice)
  end

  def post_params
    params.require(:post).permit(:title, :body)
  end
end
