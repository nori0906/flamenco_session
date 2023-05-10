module GuestTutorial::HowToRecordingsHelper
  def by_level_title(level)
    case level
    when "easy"
      "初級： クリック音に合わせてパルマを叩いてみよう!!"
    when "normal"
      "中級： ギターのタパに合わせてパルマを叩こう!!"
    when "hard"
      "上級： 実践!! ギターのフレーズに合わせてパルマを叩こう!!"
    end
  end
end
