playbackAudio()

async function playbackAudio () {
  
  //再生ボタン
  const audio = document.querySelector('#audio')
  if(audio){
    audio.addEventListener('click', () => {
      document.getElementById('btn_audio').currentTime = 0; //連続クリックに対応
      document.getElementById('btn_audio').play(); //クリックしたら音を再生
    })
  }
  
  const record = document.querySelector('#record')
  const refRecord = document.querySelector('#refRecord')
  const rootRecord = document.querySelector('#rootRecord')
  const playback = document.querySelector('#playback')
  
  
  // 再生ボタン
  if(playback){
    playback.addEventListener('click', () => {
      record.currentTime = 0; //連続クリックに対応
      record.play();
    });
  }; 
};