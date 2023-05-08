document.addEventListener('DOMContentLoaded', function () {
  const playAudioButton = document.getElementById('play-audio-button');
  const stopAudioButton = document.getElementById('stop-audio-button');

  
  
  // コンローラー追加
  const playbackTime = document.getElementById('playback-audio-time');
  const slider = document.getElementById('audio-slider');
  let source;
  let startTime;
  let resumeTime = 0; // 一時停止時間を保存する変数


  // WebAudioAPI
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let buffer;




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
      playAudioButton.disabled = true;
      stopAudioButton.disabled = false;

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
      playAudioButton.disabled = false;
      stopAudioButton.disabled = true;
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
      slider.value = progressRatio * 100;

      const minutes = Math.floor(elapsedTime / 60);
      const seconds = Math.floor(elapsedTime % 60);
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (elapsedTime >= buffer.duration) {
        playAudioButton.disabled = false;
        stopAudioButton.disabled = true;

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
        playAudioButton.disabled = false;
        stopAudioButton.disabled = true;
      };
  
      updateProgress();
    }
  });
  




  // 既存音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    buffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // 再生時間を更新するためのスライダーの最大値を設定
    slider.max = buffer.duration;
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
    playAudioButton.addEventListener('click', () => withErrorHandling(playAudio)());
    stopAudioButton.addEventListener('click', () => withErrorHandling(stopAudio)());
  }
  addEventListeners();
});