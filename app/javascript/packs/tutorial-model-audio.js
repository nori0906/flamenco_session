document.addEventListener('DOMContentLoaded', function () {
  const audioPLayback = document.getElementById('model-audio-playback');
  const audioStop = document.getElementById('model-audio-stop');
  const levelSelectText = document.getElementById('level-select').textContent;
  console.log(levelSelectText);

  // コンローラー追加
  const playbackTime = document.getElementById('model-audio-playback-time');
  const slider = document.getElementById('model-audio-slider');
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
});