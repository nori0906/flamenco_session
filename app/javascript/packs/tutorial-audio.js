document.addEventListener('DOMContentLoaded', function () {
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const playRecordingButton = document.getElementById('play-recording-button');
  const stopRecordingButton = document.getElementById('stop-recording-button');
  const playAudioButton = document.getElementById('play-audio-button');
  const stopAudioButton = document.getElementById('stop-audio-button');
  
  
  // コンローラー追加
  const audioPlayer = document.getElementById('audio-player')
  const playbackTime = document.getElementById('playback-time');
  const slider = document.getElementById('slider');
  let source;
  let startTime;
  let resumeTime = 0; // 一時停止時間を保存する変数


  // WebAudioAPI
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let mediaRecorder;
  let recordedChunks = [];
  let buffer;

  const constraints = {
    "video": false,
    "audio": {
      "echoCancellation": false,
      "autoGainControl": false,
      "noiseSuppression": false
    }
  };



  // 元となる音源の音声データの再生処理
  async function playAudio() {
    audioPlayer.play();
    playAudioButton.disabled = true;
    stopAudioButton.disabled = false;
  }

  async function stopAudio() {
    audioPlayer.pause();
    playAudioButton.disabled = false;
    stopAudioButton.disabled = true;
  }



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
    playRecordingButton.disabled = true;

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaRecorder = new MediaRecorder(stream); // 「mediaRecorder」とは？: 録音機能とそのデータを取得ができる
    mediaRecorder.start();

    mediaRecorder.addEventListener('dataavailable', (event) => {
      recordedChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', async () => {
      const blob = new Blob(recordedChunks);
      // recordAudioPlayer.src = URL.createObjectURL(blob);

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
      playRecordingButton.disabled = false;
    });
  }

  async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
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
      playRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;

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
      playRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
    }
  }

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
        playRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;

        // 再生が終了した場合、再生時間をリセット
        resetPlayback();
        resumeTime = 0; // 追加: 再生が最後まで終了した場合にresumeTimeをリセット
      } else {
        requestAnimationFrame(updateProgress);
      }
    }
  }

  slider.addEventListener('input', (event) => {
    if (source && buffer) {
      const sliderValue = event.target.value;
      const clickPositionRatio = sliderValue / 100;
      const newTime = clickPositionRatio * buffer.duration;
  
      if (!playRecordingButton.disabled) {
        source.stop();
      }
  
      startTime = audioContext.currentTime - newTime;
      source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0, newTime);
  
      playRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;
  
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
    recordButton.addEventListener('click', () => withErrorHandling(startRecording)());
    stopButton.addEventListener('click', () => withErrorHandling(stopRecording)());
    playRecordingButton.addEventListener('click', () => withErrorHandling(playRecording)());
    stopRecordingButton.addEventListener('click', () => withErrorHandling(stopPlayRecording)());
  
    playAudioButton.addEventListener('click', () => withErrorHandling(playAudio)());
    stopAudioButton.addEventListener('click', () => withErrorHandling(stopAudio)());
  }
  addEventListeners();
});
