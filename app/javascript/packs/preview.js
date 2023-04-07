
// プレビュー画像を読み込む
function previewImage() {
  const target = this.event.target;
  const file = target.files[0];
  const reader  = new FileReader();
  reader.onloadend = function () {
    const preview = document.querySelector("#preview")
    if(preview) {
      preview.src = reader.result;
    }
  }
  if (file) {
    reader.readAsDataURL(file);
  }
}

// DOMのonchange:では、グローバルスコープの問題で読み込めなかったため、イベントリスナーを使用 23/4/6
document.addEventListener("DOMContentLoaded", () => {
  const avatarImg = document.getElementById("avatarImg");
  if (avatarImg) {
      avatarImg.addEventListener("change",(e) => {
        previewImage(e)
      });
    }
  });


