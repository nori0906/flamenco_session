// 新規録音画面:コラボ元・デフォルトの音声を再生させるためのJS
document.addEventListener('DOMContentLoaded', function () {
  // 再生スライダーDOM
  // const audioPlayback = document.querySelector('.audio-playback');
  // const audioStop = document.querySelector('.audio-stop');
  // const playbackTime = document.querySelector('.audio-playback-time');
  // const slider = document.querySelector('.audio-slider');
  
  // WebAudioAPI
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let currentBuffer;
  let startTime; // 再生開始時間を示す（再生ボタンがクリックされた際のaudioCntext.currentTimeで表す）
  let resumeTime = 0; // 再開時間（秒）を示す
  // let source;



  // 仮実装
  const playButtons = document.querySelectorAll('.audio-playback');
  const stopButtons = document.querySelectorAll('.audio-stop');
  const playbackTimes = document.querySelectorAll('.audio-playback-time');
  const sliders = document.querySelectorAll('.audio-slider');
  let currentSource;
  let playButton;
  let stopButton;
  let playbackTime;
  let slider;

  
  playButtons.forEach((button) => button.addEventListener('click', async function() {
    

    const parentContainer = button.closest('.js-audio-player-container')
    playbackTime = parentContainer.querySelector('.audio-playback-time');
    slider = parentContainer.querySelector('.audio-slider');
    
    // イベントリスナーが多重で呼ばれないための分岐（ECMAScriptの仕様により必要ないかも）
    if (!slider.hasAttribute('data-listener-added')) {
      slider.addEventListener('input', sliderIvent, console.log('スライダーイベント実行'));
      // イベントリスナー実行を表すdata属性をセット
      slider.setAttribute('data-listener-added', 'true')
    }
    
    console.log('クリックボタン要素', button);
    playButton = button;
    const audioUrl = button.dataset.audioUrl
    console.log(audioUrl);
    const fetched = await fetchAudio(audioUrl);
    console.log('fetchedレスポンス', fetched);

    playAudio(fetched);
  })
  );

  stopButtons.forEach((button) => button.addEventListener('click', stopAudio));
  
  // playbackTimes.forEach((currentPlaybackTime) => playbackTime = currentPlaybackTime);
  
  // sliders.forEach((currentSlider) => slider = currentSlider);





  

  // 読み込む音源を選択
  // async function selectFetch() {
  //   if (document.querySelector('.js-default-audio-container')) {
  //     console.log("コンテナー表示", document.querySelector('.js-default-audio-container'));
  //     const fetched = await fetchAudio('/test.mp3');
  //     console.log(fetched);
  //   } else if (document.querySelector('.js-posted-audio-container')){
  //     const audioContainer = document.querySelector('.js-posted-audio-container')
  //     // 「.dataset.audioUrl」: HTMLのdata-* 属性(data-audio-url)とそれに対応するDOMのこと（dataset.プロパティ）/ ここでは音声blobデータのURLを取得している
  //     const audioUrl = audioContainer.dataset.audioUrl
  //     console.log(audioUrl);
  //     const fetched = await fetchAudio(audioUrl);
  //     console.log(fetched);
  //   }
  // }



  function playingTime(audiContext, startTime) {
    return audioContext.currentTime - startTime;
  }

  // 音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('読み込み完了');
    return audioBuffer;
    
    // 再生時間を更新するためのスライダーの最大値を設定
    // slider.max = buffer.duration;
  }

  // 再生・停止
  async function playAudio(buffer) {
    if (buffer) {
      console.log('再生開始');
      console.log('再生開始buffer', buffer);
      currentBuffer = buffer;
      

      // スライダー内の時間表示設定
      // 再生開始時のaudioContext.currentTimeを基準に再生時間を操作していく
      startTime = audioContext.currentTime - resumeTime; // 一時停止または途中再開時であればresumeTimeに経過時間が入っている

      // // 再生が終了していたら、再生位置をリセット
      // if (resumeTime >= currentBuffer.duration) {
      //   resumeTime = 0;
      // }

      const source = audioContext.createBufferSource();
      source.buffer = currentBuffer;
      source.connect(audioContext.destination);
      source.start(0, resumeTime);
      currentSource = source;


      // audioPlayback.disabled = true;
      // audioStop.disabled = false;
      // playButton.disabled = true;
      // stopButton.disabled = false;

      // スライダーの更新
      updateProgress();
    }
  }

  async function stopAudio() {
    if (currentSource) {
      console.log('再生停止');
      // 一時停止時間を保存
      resumeTime = audioContext.currentTime - startTime;

      // ソースを停止
      currentSource.stop();
      currentSource.onended = null; // onendedイベントリスナーを削除
      currentSource = null;

      // ボタンの状態を更新
      // audioPlayback.disabled = false;
      // audioStop.disabled = true;
      // playButton.disabled = false;
      // stopButton.disabled = true;
    }
  }


  // 録音コントローラー
  function resetPlayback() {
    slider.value = 0;
    playbackTime.textContent = '0:00';
    startTime = 0;
    resumeTime = 0; // 再生が最後まで終了した場合にresumeTimeをリセット
    currentSource = null; // 再生が最後まで終了した場合にsourceをリセット
    // startTime = audioContext.currentTime;
    console.log('再生リセット');

  }

  function updateProgress() {
    if (currentSource && currentBuffer) {
      // 再生開始からの経過時間
      const elapsedTime = audioContext.currentTime - startTime;
      
      // スライダーをDOMに反映
      // 進捗率をスタイダーの値に反映・0〜100が返る [(経過時間 / 総再生時間)*100]
      slider.value = (elapsedTime / currentBuffer.duration) * 100;
      // 上記コードに変更 23/8/22
      // const progressRatio = elapsedTime / currentBuffer.duration;
      // slider.value = progressRatio * 100;
      // slider.max = 100 // DOMですでに定義してあるため必要ないかも

      
      // 経過時間をDOMに反映
      // 経過時間(秒)を60で割った切り捨て値を分単位として定義
      const minutes = Math.floor(elapsedTime / 60);
      // 経過時間(秒)を60で割った余りを秒単位として定義
      const seconds = Math.floor(elapsedTime % 60);
      // DOMに反映
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;


      // 再生終了時のボタン・再生時間の設定
      if (elapsedTime >= currentBuffer.duration) {
        // audioPlayback.disabled = false;
        // audioStop.disabled = true;
        // playButton.disabled = false;
        // stopButton.disabled = true;

        // 再生時間をリセット
        resetPlayback();
        
      } else {
        // アニメーションの更新
        requestAnimationFrame(updateProgress);
      }
    }
  }

  // スライダークリック時の更新イベント
  async function sliderIvent(event) {
    console.log('スライダー関数実行', event);
    if (currentBuffer) {
      const sliderValue = event.target.value; // イベント発生時の現在値を取得
      const clickPositionRatio = sliderValue / 100; // 0から1の比率を算出
      const newTime = clickPositionRatio * currentBuffer.duration; // 現在の経過時間(秒)を算出
      // 秒・分単位ごとに値を算出
      const minutes = Math.floor(newTime / 60);
      const seconds = Math.floor(newTime % 60);
      
      resumeTime = newTime;
      
      // 経過時間をDOMに更新
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
      // 音声が一時停止中であれば終了 / 音声が再生中であれば元の音声の停止＆更新した時間帯から再生開始
      if (!currentSource || currentSource.playbackState !== AudioBufferSourceNode.PLAYING_STATE) {
        return;
      } else if (currentSource) {
        currentSource.stop(); // 現在の音声sourceの停止
        currentSource.onended = null; // onendedイベントリスナーを削除
        playAudio(currentBuffer);
      }

      // resumeTime = newTime;
  
      // 新たに算出した経過時間（newTime）を基準に再生開始 playback関数を呼び出せばこの記述減らせるかも
      // startTime = audioContext.currentTime - newTime;
      // currentSource = audioContext.createBufferSource();
      // currentSource.buffer = currentBuffer;
      // currentSource.connect(audioContext.destination);
      // currentSource.start(0, newTime);
      // updateProgress();
      
      // 再生が停止時に発火、ボタンの状態を更新
      // currentSource.onended = () => {
      //   // audioPlayback.disabled = false;
      //   // audioStop.disabled = true;
      //   // playButton.disabled = false;
      //   // stopButton.disabled = true;
      // };

    }
  }




  // エラーハンドリングをまとめる
  // function withErrorHandling(fn) {
  //   return async function (...args) {
  //     try {
  //       await fn(...args);
  //     } catch (error) {
  //       console.error(`Error in ${fn.name}:`, error);
  //     }
  //   };
  // }


  //イベントリスナー
  function addEventListeners() {
    audioPlayback.addEventListener('click', playAudio);
    audioStop.addEventListener('click', stopAudio);
  };


  ///// 関数・イベントの実行 /////
  console.log("audio-playback実行");
  // selectFetch();
  // addEventListeners();
});