module ApplicationHelper
  # s3の保存判定。画像をアップロードしていない（s3に保存されていない）場合は、デフォルト画像をアバターで表示させる
  def avatar_image_tag(user, class_name, size)
    if user.avatar.present? && user.avatar.file.exists?
      image_tag(user.avatar.url, class: class_name, size: size)
    else
      image_tag(user.avatar.default_url, class: class_name, size: size)
    end
  end
end
