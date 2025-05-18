module FfmpegHelper
  def self.generate_silent_webm(path:, duration: 1)
    cmd = build_command(path, duration)
    system(cmd)
  end

  def self.build_command(path, duration)
    "ffmpeg -y -f lavfi -i anullsrc=r=48000:cl=mono -t #{duration} -c:a libopus #{path} 2> /dev/null"
  end

  def self.fixture_exists?(path)
    File.exist?(path)
  end

  def self.fixture_delete?(path)
     File.delete(path) if File.exist?(path)
  end
end