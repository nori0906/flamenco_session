module GuestTutorial::HowToRecordingsHelper
  def by_level_title(level)
    case level
    when "easy"
      "初級： クリック音に合わせてパルマ(手拍子)を叩いてみよう!!"
    when "normal"
      "中級： ギターのタパに合わせてパルマ(手拍子)を叩こう!!"
    when "hard"
      "上級： 実践!! ギターのフレーズに合わせてパルマ(手拍子)を叩こう!!"
    end
  end
end
