class PostsController < ApplicationController
  
  def index
    @posts = Post.all
    @post = Post.find(40)
  end

  def new
    @post = Post.new
  end

  def create
    voice_data = voice_params[:voice]
    
    File.open("tempfile.webm", "wb") do |f|
      f.write(Base64.decode64(voice_data))
    end

    post = Post.new(title: "")
    post.voice.attach(io: File.open("tempfile.webm"), filename: "newfile.webm")
    if post.save
      File.delete("tempfile.webm")
      render json: { id: post.id }
    end
  end

  def show
    redirect_to edit_post_path(params[:id])
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
    post = Post.find(params[:id])
    post.update(post_params)
    redirect_to posts_path
  end

  private

  def voice_params
    params.permit(:voice)
  end

  def post_params
    params.require(:post).permit(:title, :body)
  end
end
