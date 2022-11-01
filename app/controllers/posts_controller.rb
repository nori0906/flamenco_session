class PostsController < ApplicationController
  
  def index
  end

  def new
    @post = Post.new
  end

  

  def blob
    voice_data = voice_params[:voice]
    File.open("tempfile.webm", "wb") do |f|
      f.write(Base64.decode64(voice_data))
    end
    post = Post.new(title: "sample")
    post.voice.attach(io: File.open("tempfile.webm"), filename: "newfile.webm")
    post.save
    File.delete("tempfile.webm")
  end

  private

  def voice_params
    params.permit(:voice)

  end
end
