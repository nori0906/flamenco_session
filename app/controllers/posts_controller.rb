class PostsController < ApplicationController
  
  def index
    @posts = Post.all
  end

  def new
    @post = Post.new
  end

  # def create
  #   @post = Post.new(post_params)
  #   @post.save!
  #   redirect_to posts_path, notice: "投稿しました"
  # end

  def create
    voice_data = voice_params[:voice]
    
    File.open("tempfile.webm", "wb") do |f|
      f.write(Base64.decode64(voice_data))
    end

    post = Post.new(title: "sample1")
    post.voice.attach(io: File.open("tempfile.webm"), filename: "newfile.webm")
    post.save
    File.delete("tempfile.webm")
    # render 'create'
    respond_to do |format|
      format.html { binding.pry }
      format.json { binding.pry }
      format.js { "create.js.erb" }
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

  private

  def voice_params
    params.permit(:voice)
  end

  def post_params
    params.require(:post).permit(:title, :body)
  end
end
