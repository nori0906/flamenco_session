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
  const collabPlayback = document.querySelector('#collabPlayback')
  
  const manyRecords = document.querySelectorAll('.manyRecords')
  console.log(manyRecords);
  // for of文
  for(const r of manyRecords){
    console.log(r);
  };

  
  // 再生ボタン
  if(playback){
    playback.addEventListener('click', () => {
      record.currentTime = 0; //連続クリックに対応
      record.play();
    });
  };

  // 同時再生ボタン
  if(collabPlayback){
    collabPlayback.addEventListener('click', () => {
      // for of文
      let offset = 0.350;
      for(const r of manyRecords){
        console.log(r);
        r.currentTime = offset; //連続クリックに対応
        r.play();
        offset = offset - 0.175
      };
    });
  };  
};