RSpec.configure do |config|
  config.after(:suite) do
    FileUtils.rm_rf(Rails.root.join("tmp", "storage"))
    puts "[LOAD] cleanup.rb loaded"
  end
end