createAudio()

async function createAudio () {
  const buttonStart = document.querySelector('#buttonStart')
  const buttonStop = document.querySelector('#buttonStop')
  const player = document.querySelector('#player')
  const refRecord = document.querySelector('#refRecord')
  
  const stream = await navigator.mediaDevices.getUserMedia({ // <1>
    video: false,
    audio: true,
  })
  
  if (!MediaRecorder.isTypeSupported('audio/webm')) { // <2>
    console.warn('audio/webm is not supported')
  }
  
  const mediaRecorder = new MediaRecorder(stream, { // <3>
    mimeType: 'audio/webm',
  })
  
  buttonStart.addEventListener('click', () => {
    if(refRecord){
      console.log(refRecord);
      // 録音開始時と同時に元音声を再生させる
      refRecord.play()
    }
      mediaRecorder.start() // <4>
      buttonStart.setAttribute('disabled', '')
      buttonStop.removeAttribute('disabled')
  })
  
  buttonStop.addEventListener('click', () => {
    mediaRecorder.stop() // <5>
    buttonStart.removeAttribute('disabled')
    buttonStop.setAttribute('disabled', '')
  })
  
  
  mediaRecorder.addEventListener('dataavailable', event => { // <6>
    player.src = URL.createObjectURL(event.data) //ブラウザのプレイヤーにセットするため
    
    //base64形式に変換しサーバーに送る処理
    let reader = new FileReader(); 
    reader.readAsDataURL(event.data);
    reader.onloadend = () => {
      base64 = reader.result; 
      base64 = base64.split(',')[1];
      console.log(base64);
      

      // クエリパラメーター取得
      const queryParam = window.location.search

      axios({
        method: 'post',
        url: '/posts' + queryParam,
        data: {
          voice: base64
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      })
      // 追加
      .then(function (response) {
        console.log(window.location.href = '/posts/' + response.data.id + '/edit');
      })
      .catch(function (error) {
        console.log("error");
      });
    }
  })
}