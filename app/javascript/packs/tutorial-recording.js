document.addEventListener('DOMContentLoaded', function () {
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const recordPlayback = document.getElementById('record-playback');
  const recordStop = document.getElementById('record-stop');
  const levelSelectText = document.getElementById('level-select').textContent;
  console.log(levelSelectText);
  
  // コンローラー追加
  const playbackTime = document.getElementById('record-playback-time');
  const slider = document.getElementById('record-slider');
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
  
  
  const constraints = {
    "video": false,
    "audio": {
      "echoCancellation": false,
      "autoGainControl": false,
      "noiseSuppression": false
    }
  };



  // 既存音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    buffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 再生時間を更新するためのスライダーの最大値を設定
    slider.max = buffer.duration;
  }
  // ページの読み込み時に音声ファイルをフェッチ・難易度別に音声ファイルを分岐
  // お手本音声を後で格納（23/5/8）
  function levelSelecter() {
    if (levelSelectText.includes('初級')) {
      fetchAudio('/test.mp3');
    } else if (levelSelectText.includes('中級')) {
      fetchAudio('/test.mp3');
    } else if (levelSelectText.includes('上級')) {
      fetchAudio('/test.mp3');
    }
  }
  levelSelecter()



  // 録音処理
  async function startRecording() {
    // 追加: bufferとsourceをリセット
    buffer = null;
    source = null;
    
    // 追加: スライダーの値と再生時間をリセット
    slider.value = 0;
    playbackTime.textContent = '0:00';
    resumeTime = 0;
    
    recordButton.disabled = true;
    stopButton.disabled = false;
    recordPlayback.disabled = true;
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorder = new MediaRecorder(stream); // 「mediaRecorder」とは？: 録音機能とそのデータを取得ができる
    mediaRecorder.start();
    startAudio();
    
    mediaRecorder.addEventListener('dataavailable', (event) => {
      recordedChunks.push(event.data);
    });
    
    mediaRecorder.addEventListener('stop', async () => {
      const blob = new Blob(recordedChunks);
      
      const arrayBuffer = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => {
          resolve(reader.result);
        };
      });
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      recordedChunks = [];
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
  
      // ボタンの状態を更新
      source.onended = () => {
        recordPlayback.disabled = false;
        recordStop.disabled = true;
      };
  
      updateProgress();
    }
  });



  // 既存音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    recordPlayback.disabled = true;
  }
  // ページの読み込み時に音声ファイルをフェッチ
  fetchAudio('/test.mp3');






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
});
