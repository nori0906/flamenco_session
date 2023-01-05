playbackAudio()

async function playbackAudio () {
  
  
  const record = document.querySelector('#record')
  const refRecord = document.querySelector('#refRecord')
  const rootRecord = document.querySelector('#rootRecord')
  const playback = document.querySelector('#playback')
  const stop = document.querySelector('#stop')
  
  

  // 再生時間表示
  let output = document.querySelector('#output')
  let output2 = document.querySelector('#output2')

  
  // record.addEventListener('timeupdate', () => {
  //   let time = record.currentTime;
  //   console.log( output.textContent = String(time));
  // });

  // refRecord.addEventListener('timeupdate', () => {
  //   let time2 = refRecord.currentTime;
  //   console.log( output2.textContent = String(time2));
  // });
  

  
  
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
      let audiotest = function(){
          record.play();
          refRecord.play();
      }
      setTimeout(audiotest, 3000);
    });
  }; 

  // if(stop){
  //   stop.addEventListener('click', () => {
  //     let audioTestStop = function(){
  //         record.stop();
  //         refRecord.stop();
  //     }
  //     setTimeout(audioTestStop, 0000);
  //   });
  // }; 

};