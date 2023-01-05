createAudio()

async function createAudio () {
  const buttonStart = document.querySelector('#buttonStart')
  const buttonStop = document.querySelector('#buttonStop')
  const buttonRestart = document.querySelector('#buttonRestart')
  const buttonNext = document.querySelector('#buttonNext')
  const player = document.querySelector('#player')
  const refRecord = document.querySelector('#refRecord')
  
  const stream = await navigator.mediaDevices.getUserMedia({ // <1>
    video: false,
    audio: true,
  })
  


  // 変数mimeにMIMEタイプを格納 [2]変更
  let mime = '';

  // mp4がtrueならmimeにmp4を格納し、falseならwebmがtrueかを確認する。どちらもfalseだったらアラートを返す。
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    mime = 'audio/mp4'
  } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    mime = 'audio/webm'
  } else {
    alert( 'not supported')
  };

  // 確認
  console.log(mime);

  
  const mediaRecorder = new MediaRecorder(stream, { // <3>
    mimeType: mime,
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
    buttonStop.setAttribute('disabled', '')
    buttonStart.style.display = 'none'
    buttonStop.style.display = 'none'
    buttonRestart.style.display = 'inline-block'
    buttonNext.style.display = 'inline-block'
  })
  
  buttonRestart.addEventListener('click', () => {
    if(refRecord){
      console.log(refRecord);
      // 録音開始時と同時に元音声を再生させる
      refRecord.play()
    }
    mediaRecorder.start() // <4>
    buttonStart.setAttribute('disabled', '')
    buttonStop.removeAttribute('disabled')
    buttonStart.style.display = 'inline-block'
    buttonStop.style.display = 'inline-block'
    buttonRestart.style.display = 'none'
    buttonNext.style.display = 'none'
  })

  mediaRecorder.addEventListener('dataavailable', event => { // <6>
    player.src = URL.createObjectURL(event.data) //ブラウザのプレイヤーにセットするため


    buttonNext.addEventListener('click', () => {
    
      //base64形式に変換しサーバーに送る処理
      let reader = new FileReader(); 
      reader.readAsDataURL(event.data);
      reader.onloadend = () => {
        base64 = reader.result; 
        base64 = base64.split(',')[1];
        console.log(base64);
  
        // クエリパラメーター取得
        const queryParam = window.location.search

        // MIMEタイプによって、拡張子を変数に代入
        let extType = ''
        if (mime == 'audio/mp4') {
          extType = 'm4a'
        } else if (mime == 'audio/webm') {
          extType = 'webm'
        };

  
        axios({
          method: 'post',
          url: '/posts' + queryParam,
          data: {
            voice: base64,
            ext: extType
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
      };
    });

  });
};