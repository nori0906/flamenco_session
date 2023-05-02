document.addEventListener('DOMContentLoaded', function () {
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const playRecordingButton = document.getElementById('play-recording-button');
  const stopRecordingButton = document.getElementById('stop-recording-button');
  const playAudioButton = document.getElementById('play-audio-button');
  const stopAudioButton = document.getElementById('stop-audio-button');
  const audioPlayer = document.getElementById('audio-player')
  const recordAudioPlayer = document.getElementById('record-audio-player')

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
      recordAudioPlayer.src = URL.createObjectURL(blob);

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
      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(audioContext.destination);
      bufferSource.start(0);
      stopRecordingButton.disabled = false;
      playRecordingButton.disabled = true;

      stopRecordingButton.addEventListener('click', () => {
        bufferSource.stop();
        stopRecordingButton.disabled = true;
        playRecordingButton.disabled = false;
      })
    }
  }
  
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
    playAudioButton.addEventListener('click', withErrorHandling(playAudio));
    stopAudioButton.addEventListener('click', withErrorHandling(stopAudio));
  }

  addEventListeners();
});
