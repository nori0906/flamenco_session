document.addEventListener('DOMContentLoaded', function () {
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const playRecordingButton = document.getElementById('play-recording-button');
  const stopRecordingButton = document.getElementById('stop-recording-button');
  const playAudioButton = document.getElementById('play-audio-button');
  const stopAudioButton = document.getElementById('stop-audio-button');
  const audioPlayer = document.getElementById('audio-player')
  const recordAudioPlayer = document.getElementById('record-audio-player')

  // コンローラー追加
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const playhead = document.getElementById('playhead');
  const playbackTime = document.getElementById('playback-time');
  let source;
  let startTime;



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


  // 録音処理
  async function startRecording() {
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
  }

  async function playRecording() {
    if (buffer) {
      startTime = audioContext.currentTime;


      source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      playRecordingButton.disabled = true;
      stopRecordingButton.disabled = false;

      updateProgress();
    }
  }

  async function stopPlayRecording() {
    if (source) {
      source.stop();
      source = null;
      playRecordingButton.disabled = false;
      stopRecordingButton.disabled = true;
    }
  }


  // コントローラー関連
  function updateProgress() {
    if (source && buffer) {
      const elapsedTime = audioContext.currentTime - startTime;
      const progressRatio = elapsedTime / buffer.duration;
      progressBar.style.width = progressRatio * 100 + '%';
  
      // 追加: 再生位置のマーカーと再生時間を更新
      playhead.style.left = progressRatio * 100 + '%';
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = Math.floor(elapsedTime % 60);
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
      if (elapsedTime >= buffer.duration) {
        playRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
      } else {
        requestAnimationFrame(updateProgress);
      }
    }
  }

  progressContainer.addEventListener('click', (event) => {
    if (source && buffer) {
      const clickX = event.clientX;
      const containerStartX = progressContainer.getBoundingClientRect().left;
      const containerWidth = progressContainer.clientWidth;

      const clickPositionRatio = (clickX - containerStartX) / containerWidth;
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

  // withErrorHandlingで各関数をラップしてエラーハンドリングおこなう
  function addEventListeners() {
    recordButton.addEventListener('click', withErrorHandling(startRecording));
    stopButton.addEventListener('click', withErrorHandling(stopRecording));
    playRecordingButton.addEventListener('click', withErrorHandling(playRecording));
    stopRecordingButton.addEventListener('click', withErrorHandling(stopPlayRecording));

    playAudioButton.addEventListener('click', withErrorHandling(playAudio));
    stopAudioButton.addEventListener('click', withErrorHandling(stopAudio));
  }
  addEventListeners();
});
