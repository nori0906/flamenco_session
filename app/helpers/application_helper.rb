module ApplicationHelper
  # FIXME: アバター画像の一時的パス判定。パスはあるがファイルが存在しない場合にデフォルト画像を表示
  def avatar_image_tag(user, class_name, size)
    if user.avatar.present? && File.exist?(user.avatar.path)
      image_tag(user.avatar.url, class: class_name, size: size)
    else
      image_tag(user.avatar.default_url, class: class_name, size: size)
    end
  end
end
