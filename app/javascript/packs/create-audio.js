createAudio()

async function createAudio () {
  const buttonStart = document.querySelector('#buttonStart')
  const buttonStop = document.querySelector('#buttonStop')
  const buttonRestart = document.querySelector('#buttonRestart')
  const buttonNext = document.querySelector('#buttonNext')
  const player = document.querySelector('#player')
  const refRecord = document.querySelector('#refRecord')


  // ブラウザがchromeであるか確認
  const ua = window.navigator.userAgent.toLowerCase() //ブラウザのユーザーエージェントを取得（小文字に変換）し変数uaに格納
  const chrome = (ua.indexOf('chrome') !== -1) && (ua.indexOf('edge') === -1) && (ua.indexOf('opr') === -1); // ブラウザがchromeかどうかを確認し、結果の真偽値を変数に格納
  // オーディオ制約を設定
  let constraints;
  if(chrome){
    constraints = {
      "video": false,
      "audio": {
        // 参考: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings#instance_properties_of_audio_tracks
        "mandatory": {
          // chrome固有の設定->最新のブラウザではMediaTrackConstraints APIの使用が一般的なため、記述を統一しても良いかもしれない
          "googEchoCancellation" : false, // エコーキャンセルが必須か優先かを指定するオブジェクト
          "googAutoGainControl" : false, // 自動ゲイン制御が優先か必須かどうか
          "googNoiseSuppression" : false, // ノイズ抑制が優先か必要か
          "googHighpassFilter" : false // 指定した周波数以上を通過させ、低域をカットできるフィルターを指定するか
        }
      }
    };
  // FireFox/Edge/safari
  }else{
    constraints = {
      "video": false,
      "audio": {
        "mandatory": {
          "echoCancellation" : false,
          "autoGainControl" : false,
          "noiseSuppression" : false
        }
      }
    };
  }

  // マイクの使用許可をユーザーに確認し結果を格納
  const stream = await navigator.mediaDevices.getUserMedia(constraints)

  // 変数mimeにMIMEタイプを格納
  let mime;
  // サポート状況を確認し、変数に格納
  if (MediaRecorder.isTypeSupported('audio/mp4')) {
    mime = 'audio/mp4'
  } else if (MediaRecorder.isTypeSupported('audio/webm')) {
    mime = 'audio/webm'
  } else {
    alert( 'not supported')
  };
  // 確認
  console.log(mime);

  // MIMEタイプを指定しオブジェクトの作成
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: mime
  })
  const audioChunks = [];




  // イベントリスナー
  buttonStart.addEventListener('click', () => {
    if(refRecord){
      console.log(refRecord);
      // 録音開始時と同時に元音声を再生させる
      refRecord.play()
    }
      mediaRecorder.start()
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


  mediaRecorder.addEventListener('dataavailable', event => {
    // 「event.data」はすでにblob形式をデータを持っている
    player.src = URL.createObjectURL(event.data) //ブラウザのプレイヤーにセットするため
    audioChunks.push(event.data);
  });

  // 録音完了時のボタンをクリックした際に発火・サーバーに送信する処理を実行
  buttonNext.addEventListener('click', () => {
    const audioBlob = new Blob(audioChunks, {type: mime});

    // MIMEタイプによって、拡張子を取得
    let subType = ''
    if (mime == 'audio/mp4') {
      subType = 'm4a'
    } else if (mime == 'audio/webm') {
      subType = 'webm'
    };

    const formData = new FormData();
    formData.append('recording[voice]', audioBlob, `recording.${subType}`);



    // 非同期（Ajax）でサーバーに音声データを送信
    axios({
      method: 'post',
      url: '/recordings',
      data: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    }).then((response) => {
      // サーバーから返されたBlob IDを取得
      const blobId = response.data.id;
      const blobUrl = response.data.blob_url;


      // 投稿フォームを表示
      const form = document.getElementById('post_form');
      form.style.display = 'block';

      // 録音画面を非表示にする
      const recordingScreen = document.getElementById('recording_screen');
      recordingScreen.style.display = 'none';

      const record = document.getElementById('record');
      // Blobのsigned_idからURLを取得
      record.src = blobUrl;
  
      // フォームの隠しフィールドにBlob IDを設定
      const blobIdInput = document.getElementById('post_voice_blob_id');
      blobIdInput.value = blobId;

    }).catch(function (error) {
      console.log(error);
    });
  });
};