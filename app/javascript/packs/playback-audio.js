playbackAudio()

async function playbackAudio () {
  
  
  const record = document.querySelector('#record')
  const refRecord = document.querySelector('#refRecord')
  const rootRecord = document.querySelector('#rootRecord')
  const playback = document.querySelector('#playback')
  const stopBtn = document.querySelector('#stopBtn')
  
  

  // 再生時間表示
  let output = document.querySelector('#output')
  let output2 = document.querySelector('#output2')
  let output3 = document.querySelector('#output3')

  
  record.addEventListener('timeupdate', () => {
    let time = record.currentTime;
    output.textContent = String(time)
  });

  if(refRecord) {
    refRecord.addEventListener('timeupdate', () => {
      let time2 = refRecord.currentTime;
      output2.textContent = String(time2)
      console.log(output3.textContent = Number(output2.textContent) - Number(output.textContent));
    });
  };
  
  

  
  
  // 再生ボタン
  // if(playback){
  //   playback.addEventListener('click', () => {
  //     // record.currentTime = 0; //連続クリックに対応
  //     // refRecord.currentTime = 0; //連続クリックに対応
  //     record.play();
  //     refRecord.play();
  //   });
  // };
  
  if(playback){
    playback.addEventListener('click', () => {
      if (refRecord) {
        record.play();
        refRecord.play();
      } else {
        record.play();
      };
      // let audiotest = function(){
      // }
      // setTimeout(audiotest, 1000);
    });
  };

  if(stopBtn){
    stopBtn.addEventListener('click', () => {
      record.pause();
      refRecord.pause();
    });
  }; 

};