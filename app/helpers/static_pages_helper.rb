module StaticPagesHelper
  # pictureタグ内のsorurceタグでimage_pack_tag使用する際に使用
  def image_pack_src(path)
    image_tag = image_pack_tag(path)
    src_match = image_tag.match(/src="([^"]*)"/)
    src_match[1] if src_match
  end
end
