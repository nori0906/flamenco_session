playbackAudio()

async function playbackAudio () {
  
  
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