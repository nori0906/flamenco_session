module GuestTutorial::HowToRecordingsHelper
  def by_level_title(level)
    case level
    when "easy"
      {type: "初級☆", title: "クリック音に合わせてパルマ(手拍子)を叩いてみよう!"}
    when "normal"
      {type: "中級☆☆", title: "ギターのタパに合わせてパルマ(手拍子)を叩こう!"}
    when "hard"
      {type: "上級☆☆☆", title: "ギターのフレーズに合わせてパルマ(手拍子)を叩こう!"}
    end
  end
end
