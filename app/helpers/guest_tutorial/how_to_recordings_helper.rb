module GuestTutorial::HowToRecordingsHelper
  def by_level(level)
    case level
    when "easy"
      "初級"
    when "normal"
      "中級"
    when "hard"
      "上級"
    end
  end
end
