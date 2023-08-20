document.addEventListener('DOMContentLoaded', function () {
  //// 初期値の定義 ////
  // DOM
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const buttonNext = document.querySelector('#buttonNext');

  // 再生関連DOM（画面ごとに再利用できるようにletで定義）
  let recordPlayback;
  let recordStop;
  let playbackTime;
  let slider;

  // 再生時間（スライダー内の表示処理で使用）
  let startTime // 再生スタート時の時間を保存
  let resumeTime = 0; // 一時停止時間を保存

  // ボタン判定用フラグ（録音・再生中かどうかの判定ように使用）
  let recordingFlag = false;
  let playingFlag = false;

  // MediaRecordingAPI  WebAudioAPI
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let constraints; //オーディオ制約
  let mime;
  let subType;
  let mediaRecorder;
  let recordedChunks = [];
  // 現状audioBufferの中身が更新されることでそれぞれ再生内容が変化している。23/07/15
  let audioBuffer;
  let audioBlob;
  let audioSource;

  // コラボ元音源を格納するための変数を定義（録音時）
  let defaultAudio;
  let collabAudio;




  //// 関数定義 ////
  /// 録音 ///
  // コラボ元の音源がある場合音声データを取得
  function collabSourceSetting() {
    console.log('コラボ音源の設定を実行');
    // コラボ音源の再生分岐
    if (document.querySelector('.js-default-audio-container') ) {
      defaultAudio = new Audio('/test.mp3');
      defaultAudio.addEventListener('loadeddata', () => {
        console.log('defaltAudio data loaded.');
        console.log(defaultAudio);
      });
    } else if (document.querySelector('.js-posted-audio-container')) {
      const audioContainer = document.querySelector('.js-posted-audio-container')
      const audioUrl = audioContainer.dataset.audioUrl
      console.log(audioUrl);
      collabAudio = new Audio(audioUrl);
      collabAudio.addEventListener('loadeddata', () => {
        console.log('collabAudio data loaded.');
        console.log(collabAudio);
      });
    }
  }

  // コラボ元音源を再生
  function audioSourcePlay() {
    if (defaultAudio) {
      defaultAudio.play()
      console.log('デフォ再生開始');
    } else if (collabAudio) {
      collabAudio.play()
      console.log('コラボ再生開始');
    }
  }

  // コラボ元音源を停止
  function audioSourcePause() {
    if (defaultAudio) {
      defaultAudio.pause()
      defaultAudio.currentTime = 0;
      console.log('デフォ再生停止');
    } else if (collabAudio) {
      collabAudio.pause()
      collabAudio.currentTime = 0;
      console.log('コラボ再生停止');
    }
  }


  // オーディオ制約・MIMEタイプを判定
  function settingRecordData() {
    console.log('オーディオ制約を設定');
    // ボタン設定
    // recordPlaybackが別関数ないで定義してあるためDOM取得できず。のち修正 23/07/15
    // recordPlayback.disabled = true;

    // if文でDOMがない場合のエラーを防ぐ
    if (buttonNext) {
      buttonNext.style.display = 'none';
    };

    // ブラウザを特定
    const ua = window.navigator.userAgent.toLowerCase() //ブラウザのユーザーエージェントを取得（小文字に変換）し変数uaに格納
    const chrome = (ua.indexOf('chrome') !== -1) && (ua.indexOf('edge') === -1) && (ua.indexOf('opr') === -1); // ブラウザがchromeかどうかを確認し、結果の真偽値を変数に格納

    // オーディオ制約を設定
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

    // MIMEタイプを指定
    // サポート状況を確認し、変数に格納
    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mime = 'audio/mp4'
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mime = 'audio/webm'
    } else {
      alert( 'not supported')
    };
    // サブタイプ名を取得
    const mimeToSubType = {
      'audio/mp4': 'm4a',
      'audio/webm': 'webm'
    };
    subType = mimeToSubType[mime] || '';
  }

  function resetAudioData() {
    console.log('データリセット前確認');
    console.log(audioBlob);
    console.log(audioSource);
    console.log(audioBuffer);
    console.log(recordedChunks);

    console.log('データリセット確認');
    console.log(audioBlob = null);
    console.log(audioSource = null);
    console.log(audioBuffer = null);
    console.log(recordedChunks = []);
  }


  // 録音開始
  async function recording() {
    // 録音時に格納したデータをリセット
    audioBlob != null ? resetAudioData() : null;
    // if(audioBlob != null) {
    //   resetAudioData();
    // }

    // ボタン表示設定
    recordingFlag = true;
    setButtonStatus();
    // if文でDOMがない場合のエラーを防ぐ
    if (buttonNext) {
      buttonNext.style.display = 'none';
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorder = new MediaRecorder(stream, {mimeType: mime}); // 「mediaRecorder」: 録音機能とそのデータを取得
    mediaRecorder.start();

    // コラボ元音源がある場合再生する
    defaultAudio || collabAudio ? audioSourcePlay() : null;
    
    mediaRecorder.addEventListener('dataavailable', (event) => {
      recordedChunks.push(event.data);
    });
    
    // イベントリスナー
    const audioBlobPromis = new Promise((resolve) => {
      mediaRecorder.addEventListener('stop', async () => {
        // constにすると値を引き渡せない?
        audioBlob = new Blob(recordedChunks, {type: mime});
        resolve(audioBlob);
      });
    })
    return audioBlobPromis;
  }

  // 録音停止
  async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // stopAudio();
      mediaRecorder.stop();

      // コラボ元音源がある場合停止する
      defaultAudio || collabAudio ? audioSourcePause() : null;

      recordingFlag = false;
      setButtonStatus();
    }
  }



  /// 再生 ///
  // 再生・停止処理
  async function playBackControls(displayType) {
    console.log('playBackControls実行');
    /// 再生処理に関するDOM取得 ///
    recordPlayback = document.querySelector(`.${displayType}-record-playback`);
    recordStop = document.querySelector(`.${displayType}-record-stop`);
    playbackTime = document.querySelector(`.${displayType}-record-playback-time`);
    slider = document.querySelector(`.${displayType}-record-slider`);
    console.log(recordPlayback);
    console.log(recordStop);
    console.log(playbackTime);
    console.log(slider);

    /// 関数 ///
    // 再生・一時停止
    function playRecording() {
      console.log('再生');
      if (audioBuffer) {
        startTime = audioContext.currentTime - resumeTime; // resumeTimeを考慮する
        
        // 再生が終了していたら、再生位置をリセット
        if (audioContext.currentTime - startTime >= audioBuffer.duration) {
          resumeTime = 0;
        }
        
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0, resumeTime);
        

        playingFlag = true;
        setButtonStatus();
        
        
        // 再生を開始する前にupdateProgress関数を呼び出す
        updateProgress();
      }
    }

    function stopPlayRecording() {
      console.log('停止');
      if (audioSource) {
        // 一時停止時間を保存
        resumeTime = audioContext.currentTime - startTime;
        
        // ソースを停止
        audioSource.stop();
        audioSource.onended = null; // onendedイベントリスナーを削除
        audioSource = null;
        
        // ボタンの状態を更新
        playingFlag = false;
        setButtonStatus();
      }
    }

    // 音声コントローラー
    function resetPlayback() {
      slider.value = 0;
      playbackTime.textContent = '0:00';
      startTime = audioContext.currentTime;
      resumeTime = 0; // 再生が最後まで終了した場合にresumeTimeをリセット
      audioSource = null; // 再生が最後まで終了した場合にsourceをリセット
    }
    function updateProgress() {
      if (audioSource && audioBuffer) {
        const elapsedTime = audioContext.currentTime - startTime;
        const progressRatio = elapsedTime / audioBuffer.duration;
        slider.max = 100
        slider.value = progressRatio * 100;

        const minutes = Math.floor(elapsedTime / 60);
        const seconds = Math.floor(elapsedTime % 60);
        playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (elapsedTime >= audioBuffer.duration) {
          playingFlag = false;
          setButtonStatus();

          // 再生が終了した場合、再生時間をリセット
          resetPlayback();
          console.log('タイムリセット');
          // resumeTime = 0; // 再生が最後まで終了した場合にresumeTimeをリセット
          // audioSource = null; // 再生が最後まで終了した場合にsourceをリセット
        } else {
          requestAnimationFrame(updateProgress);
        }
      }
    }
    async function sliderHandring(event) {
      if (audioBuffer) {
        const sliderValue = event.target.value;
        const clickPositionRatio = sliderValue / 100;
        const newTime = clickPositionRatio * audioBuffer.duration;

        // 再生時間表示の更新
        const minutes = Math.floor(newTime / 60);
        const seconds = Math.floor(newTime % 60);
        playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
        // オーディオが再生されていない場合は、resumeTimeを更新して返す
        if (!audioSource || source.playbackState !== 'playing') {
          resumeTime = newTime;
          return;
        }
    
        // 既存のオーディオが再生されている場合は、再生を停止する
        if (audioSource) {
          audioSource.stop(); // 既存のsourceを停止する
          audioSource.onended = null; // onendedイベントリスナーを削除
        }
    
        startTime = audioContext.currentTime - newTime;
        resumeTime = newTime;
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0, newTime);
    
        // 再生が停止したら、ボタンの状態を更新
        audioSource.onended = () => {
          audioPLayback.disabled = false;
          audioStop.disabled = true;
        };
    
        updateProgress();
      }
    }
    
    // 実行管理
    function handlePlayBack(event) {
      console.log('handle実行');
      playStatus = ['post-record-playback', 'form-record-playback', 'collab-record-playback']
      pauseStatus = ['post-record-stop', 'form-record-stop', 'collab-record-stop']
      
      
      if (playStatus.some(className => event.currentTarget.classList.contains(className))) {
        playRecording()
      } else if (pauseStatus.some(className => event.currentTarget.classList.contains(className))) {
        stopPlayRecording()
      }
    }
    
    /// イベント ///
    recordPlayback.addEventListener('click', handlePlayBack);
    recordStop.addEventListener('click', handlePlayBack);
    slider.addEventListener('input', async (event) => sliderHandring(event));
  }



  /// 変換 ///
  // 新規音声データをバッファーへ変換
  async function createAudioBuffer(audioBlob) {
    console.log('createAudioBuffer実行');
    if (audioBlob != null) {
      const arrayBuffer = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(audioBlob);
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // if文でDOMがない場合のエラーを防ぐ
      if (buttonNext) {
        buttonNext.style.display = 'inline-block';
      };

      return audioBuffer;
    }
  }

  // 既存音声ファイルを読み込みバッファへ変換
  async function fetchAudio(audioUrl) {
    console.log('fetchAudio実行');
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // オーディオバッファにデコード
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
    // try{
    // }catch(e){
    //   console.log(e);
    // }
  }



  /// ボタン表示 ///
  function setButtonStatus() {
    const buttonStatus = {
      recording: { record: true, stop: false, playback: true, pause: true },
      playing: { record: true, stop: true, playback: true, pause: false },
      idle: { record: false, stop: true, playback: false, pause: true },
      default: { record: false, stop: true, playback: true, pause: true }
    }

    let currentState;

    if(recordingFlag == true && playingFlag == false) {
      currentState = buttonStatus.recording;
    } else if(recordingFlag == false && playingFlag == true) {
      currentState = buttonStatus.playing;
    } else if(recordingFlag == false && playingFlag == false) {
      currentState = buttonStatus.idle;
    } else {
      currentState = buttonStatus.default;
    }

    recordButton.disabled = currentState.record; //録音ボタン
    stopButton.disabled = currentState.stop; //停止ボタン
    recordPlayback.disabled = currentState.playback; //再生ボタン
    recordStop.disabled = currentState.pause; //一時停止ボタン
  }



  /// サーバーへリクエスト処理 ///
  // サーバー送信処理
  async function sendToSever() {
    const formData = new FormData();
    formData.append('recording[voice]', audioBlob, `recording.${subType}`);
    resetAudioData();

    // 非同期（Ajax）でサーバーに音声データを送信
    const response = await axios({
      method: 'post',
      url: '/recordings',
      data: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      }
    })
    return response;
  }



  /// サーバーからのレスポンス処理 ///
  // フォームの表示
  function displayElement(id, display) {
    const element = document.getElementById(id);
    element.style.display = display;
  }

  // レスポンス処理の一連管理
  async function handleResponse(response) {
    console.log('handleResponse実行');
    console.log(response);

    // サーバーから返されたBlob IDとURL（activestorage）を取得
    const blobId = response.data.id;
    const blobUrl = response.data.blob_url;
    // 隠しフォームDOMを取得
    const blobIdInput = document.getElementById('post_voice_blob_id');


    // 画面表示切り替え
    displayElement('post_form', 'block');
    displayElement('recording_screen', 'none');

    // フォームの隠しフィールドにBlob IDを設定
    blobIdInput.value = blobId;

    // レスポンスの音声データをバッファに更新
    audioBuffer = await fetchAudio(blobUrl)
    console.log(audioBuffer);

    // 再生処理実行
    playBackControls('form')
  }




  //// イベント・関数の実行 ////
  /// 事前に実行 ///
  console.log("create-audio実行");
  // 引数に録音画面時の再生用DOMを渡す（関数内で再生イベント発火）
  playBackControls('post')

  // 録音時のコラボ音源を設定
  collabSourceSetting()

  // オーディオ設定
  settingRecordData()


  /// イベント ///
  // 録音
  // 録音完了したら、結果（blobデータ）を受け取ってバッファを作成する
  recordButton.addEventListener('click', () => {
      recording().then( async (blob) => {
        await createAudioBuffer(blob);
        }).catch((e) => {
        console.error("An error occurred during recording or decoding: ", e);
      })
    });

  // 録音停止
  stopButton.addEventListener('click', stopRecording);
  
  // try {
  //   await recording()
  //   playBackControls('post')
  // } catch (e) {
  //   console.error("An error occurred during recording or decoding: ", e);
  // };


  // サーバー送信以降
  // if文でDOMがない場合のエラーを防ぐ
  if (buttonNext) {
    buttonNext.addEventListener('click', () => {
      sendToSever().then((response) => {
        handleResponse(response);
      }).catch((e) => {
        console.log(e);
      });
    });
  };
});
