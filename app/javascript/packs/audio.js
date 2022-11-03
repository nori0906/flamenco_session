audio()

async function audio () {
  const audio = document.querySelector('#audio')

  //再生
  audio.addEventListener('click', () => {
    document.getElementById('btn_audio').currentTime = 0; //連続クリックに対応
    document.getElementById('btn_audio').play(); //クリックしたら音を再生
  })
}