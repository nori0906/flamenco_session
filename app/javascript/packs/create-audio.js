createAudio()

async function createAudio () {
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const recordPlayback = document.getElementById('post-record-playback');
  const recordStop = document.getElementById('post-record-stop');
  const buttonNext = document.querySelector('#buttonNext')
  
  // コンローラー追加
  const playbackTime = document.getElementById('post-record-playback-time');
  const slider = document.getElementById('post-record-slider');
  let startTime;
  let resumeTime = 0; // 一時停止時間を保存する変数
  
  
  // WebAudioAPI
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaRecorder;
  let recordedChunks = [];
  let buffer;
  let audioBuffer; // 既存音声バッファを格納
  let source;
  let audioSource; // 既存音声ソースを格納
  let blob
  

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



  // 既存音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    buffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 再生時間を更新するためのスライダーの最大値を設定
    slider.max = buffer.duration;
  }



  // 録音処理
  async function startRecording() {
    // 音声データをリセット
    buffer = null;
    source = null;
    blob = null;
    // 録音時に格納したデータをリセット
    recordedChunks = [];
    
    // 追加: スライダーの値と再生時間をリセット
    slider.value = 0;
    playbackTime.textContent = '0:00';
    resumeTime = 0;
    
    recordButton.disabled = true;
    stopButton.disabled = false;
    recordPlayback.disabled = true;
    buttonNext.style.display = 'none'
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorder = new MediaRecorder(stream, {mimeType: mime}); // 「mediaRecorder」とは？: 録音機能とそのデータを取得ができる
    mediaRecorder.start();
    startAudio();
    
    mediaRecorder.addEventListener('dataavailable', (event) => {
      recordedChunks.push(event.data);
    });
    
    mediaRecorder.addEventListener('stop', async () => {
      blob = new Blob(recordedChunks, {type: mime});
      
      const arrayBuffer = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
      
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      buffer = audioBuffer;
      recordPlayback.disabled = false;

    });
  }
  
  async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      stopAudio();
      mediaRecorder.stop();
      stopButton.disabled = true;
      recordButton.disabled = false;
      buttonNext.style.display = 'inline-block'
    }
    
    // bufferがnullでないことを確認
    if (buffer) {
      // スライダーの最大値を更新
      slider.max = buffer.duration;
    }
  }
  
  async function playRecording() {
    if (buffer) {
      startTime = audioContext.currentTime - resumeTime; // resumeTimeを考慮する
      
      // 再生が終了していたら、再生位置をリセット
      if (audioContext.currentTime - startTime >= buffer.duration) {
        resumeTime = 0;
      }
      
      source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0, resumeTime);
      recordPlayback.disabled = true;
      recordStop.disabled = false;
      
      // 再生を開始する前にupdateProgress関数を呼び出す
      updateProgress();
    }
  }
  
  async function stopPlayRecording() {
    if (source) {
      // 一時停止時間を保存
      resumeTime = audioContext.currentTime - startTime;
      
      // ソースを停止
      source.stop();
      source.onended = null; // onendedイベントリスナーを削除
      source = null;
      
      // ボタンの状態を更新
      recordPlayback.disabled = false;
      recordStop.disabled = true;
    }
  }
  

  // 録音開始時に音声ファイルを再生
  function startAudio() {
    if (audioBuffer) {
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.connect(audioContext.destination);
      audioSource.start();
    }
  };
  
  function stopAudio() {
    if (audioSource) {
      // ソースを停止
      audioSource.stop();
    }
  };
  

  // 録音コントローラー
  // 再生時間をリセットし、再生ボタンをクリックしたときに音声が初めから再生
  function resetPlayback() {
    slider.value = 0;
    playbackTime.textContent = '0:00';
    startTime = audioContext.currentTime;
  }

  function updateProgress() {
    if (source && buffer) {
      const elapsedTime = audioContext.currentTime - startTime;
      const progressRatio = elapsedTime / buffer.duration;
      slider.max = 100
      slider.value = progressRatio * 100;

      const minutes = Math.floor(elapsedTime / 60);
      const seconds = Math.floor(elapsedTime % 60);
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (elapsedTime >= buffer.duration) {
        recordPlayback.disabled = false;
        recordStop.disabled = true;

        // 再生が終了した場合、再生時間をリセット
        resetPlayback();
        resumeTime = 0; // 再生が最後まで終了した場合にresumeTimeをリセット
        source = null; // 再生が最後まで終了した場合にsourceをリセット
      } else {
        requestAnimationFrame(updateProgress);
      }
    }
  }

  // slider.addEventListener('input', async (event) => {
  //   if (buffer) {
  //     const sliderValue = event.target.value;
  //     const clickPositionRatio = sliderValue / 100;
  //     const newTime = clickPositionRatio * buffer.duration;
  
  //     // 再生時間表示の更新
  //     const minutes = Math.floor(newTime / 60);
  //     const seconds = Math.floor(newTime % 60);
  //     playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  //     // オーディオが再生されていない場合は、resumeTimeを更新して返す
  //     if (!source || source.playbackState !== AudioBufferSourceNode.PLAYING_STATE) {
  //       resumeTime = newTime;
  //       return;
  //     }
  
  //     // 既存のオーディオが再生されている場合は、再生を停止する
  //     if (source) {
  //       source.stop(); // 既存のsourceを停止する
  //       source.onended = null; // onendedイベントリスナーを削除
  //     }
  
  //     startTime = audioContext.currentTime - newTime;
  //     resumeTime = newTime;
  //     source = audioContext.createBufferSource();
  //     source.buffer = buffer;
  //     source.connect(audioContext.destination);
  //     source.start(0, newTime);
  
  //     // ボタンの状態を更新
  //     source.onended = () => {
  //       recordPlayback.disabled = false;
  //       recordStop.disabled = true;
  //     };
  
  //     updateProgress();
  //   }
  // });


  // エラーハンドリングをまとめる
  function withErrorHandling(fn) {
    return async function (...args) {
      try {
        await fn(...args);
      } catch (error) {
        console.error(`Error in ${fn.name}:`, error);
      }
    };
  }



  //イベントリスナー
  // withErrorHandlingで各関数をラップしてエラーハンドリングおこなう
  function addEventListeners() {
    recordButton.addEventListener('click', () => withErrorHandling(startRecording)());
    stopButton.addEventListener('click', () => withErrorHandling(stopRecording)());
    recordPlayback.addEventListener('click', () => withErrorHandling(playRecording)());
    recordStop.addEventListener('click', () => withErrorHandling(stopPlayRecording)());
  }
  addEventListeners();






  // 録音完了時のボタンをクリックした際に発火・サーバーに送信する処理を実行
  buttonNext.addEventListener('click', () => {
    // const audioBlob = new Blob(audioChunks, {type: mime});
    

    // MIMEタイプによって、拡張子を取得
    let subType = ''
    if (mime == 'audio/mp4') {
      subType = 'm4a'
    } else if (mime == 'audio/webm') {
      subType = 'webm'
    };

    const formData = new FormData();
    formData.append('recording[voice]', blob, `recording.${subType}`);



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


      // フォームの表示設定
      // 投稿フォームを表示
      const form = document.getElementById('post_form');
      form.style.display = 'block';
      // 録音画面を非表示
      const recordingScreen = document.getElementById('recording_screen');
      recordingScreen.style.display = 'none';

      // フォーム内の設定
      // フォームの隠しフィールドにBlob IDを設定
      const blobIdInput = document.getElementById('post_voice_blob_id');
      blobIdInput.value = blobId;



      // 音声再生処理
      // 再生ボタンのDOM
      const audioPLayback = document.getElementById('form-audio-playback');
      const audioStop = document.getElementById('form-audio-stop');
      
      // コンローラー追加
      const playbackTime = document.getElementById('form-audio-playback-time');
      const slider = document.getElementById('form-audio-slider');
      let source;
      let startTime;
      let resumeTime = 0; // 一時停止時間を保存する変数
      
      // WebAudioAPI
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let buffer;
      
      // 既存音声ファイルを読み込み
      async function fetchAudio(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
        buffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // 再生時間を更新するためのスライダーの最大値を設定
        // slider.max = buffer.duration;
      }
      fetchAudio(blobUrl);

      async function playAudio() {
        if (buffer) {
          startTime = audioContext.currentTime - resumeTime; // resumeTimeを考慮する

          // 再生が終了していたら、再生位置をリセット
          if (audioContext.currentTime - startTime >= buffer.duration) {
            resumeTime = 0;
          }

          source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0, resumeTime);
          audioPLayback.disabled = true;
          audioStop.disabled = false;

          // 再生を開始する前にupdateProgress関数を呼び出す
          updateProgress();
        }
      }

      async function stopAudio() {
        if (source) {
          // 一時停止時間を保存
          resumeTime = audioContext.currentTime - startTime;

          // ソースを停止
          source.stop();
          source.onended = null; // onendedイベントリスナーを削除
          source = null;

          // ボタンの状態を更新
          audioPLayback.disabled = false;
          audioStop.disabled = true;
        }
      }


      // 録音コントローラー
      function resetPlayback() {
        slider.value = 0;
        playbackTime.textContent = '0:00';
        startTime = audioContext.currentTime;
      }

      function updateProgress() {
        if (source && buffer) {
          const elapsedTime = audioContext.currentTime - startTime;
          const progressRatio = elapsedTime / buffer.duration;
          slider.max = 100
          slider.value = progressRatio * 100;

          

          const minutes = Math.floor(elapsedTime / 60);
          const seconds = Math.floor(elapsedTime % 60);
          playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

          if (elapsedTime >= buffer.duration) {
            audioPLayback.disabled = false;
            audioStop.disabled = true;

            // 再生が終了した場合、再生時間をリセット
            resetPlayback();
            resumeTime = 0; // 追加: 再生が最後まで終了した場合にresumeTimeをリセット
            source = null; // 再生が最後まで終了した場合にsourceをリセット
          } else {
            requestAnimationFrame(updateProgress);
          }
        }
      }

      slider.addEventListener('input', async (event) => {
        if (buffer) {
          const sliderValue = event.target.value;
          const clickPositionRatio = sliderValue / 100;
          const newTime = clickPositionRatio * buffer.duration;

          // 再生時間表示の更新
          const minutes = Math.floor(newTime / 60);
          const seconds = Math.floor(newTime % 60);
          playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
          // オーディオが再生されていない場合は、resumeTimeを更新して返す
          if (!source || source.playbackState !== AudioBufferSourceNode.PLAYING_STATE) {
            resumeTime = newTime;
            return;
          }
      
          // 既存のオーディオが再生されている場合は、再生を停止する
          if (source) {
            source.stop(); // 既存のsourceを停止する
            source.onended = null; // onendedイベントリスナーを削除
          }
      
          startTime = audioContext.currentTime - newTime;
          resumeTime = newTime;
          source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0, newTime);
      
          // 再生が停止したら、ボタンの状態を更新
          source.onended = () => {
            audioPLayback.disabled = false;
            audioStop.disabled = true;
          };
      
          updateProgress();
        }
      });

      // エラーハンドリングをまとめる
      function withErrorHandling(fn) {
        return async function (...args) {
          try {
            await fn(...args);
          } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
          }
        };
      }

      //イベントリスナー
      // withErrorHandlingで各関数をラップしてエラーハンドリングおこなう
      function addEventListeners() {
        audioPLayback.addEventListener('click', () => withErrorHandling(playAudio)());
        audioStop.addEventListener('click', () => withErrorHandling(stopAudio)());
      }
      addEventListeners();


    }).catch(function (error) {
      console.log(error);
    });
  });
};