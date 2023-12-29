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
  // let resumeTime; // 再開時間（秒）を示す
  

  // 追加実装: カードごとに音声プレイヤーを実行させる 23/8/24
  const playButtons = document.querySelectorAll('.audio-playback');
  let currentSource;
  let playButton;
  let stopButton;
  let playbackTime;
  let slider;


  // イベントリスナー
  playButtons.forEach((button) => button.addEventListener('click', async function() {
    const parentContainer = button.closest('.js-audio-player-container')
    playbackTime = parentContainer.querySelector('.audio-playback-time');
    slider = parentContainer.querySelector('.audio-slider');
    stopButton = parentContainer.querySelector('.audio-stop');

    // resumeTimeの初期化（異なる再生ボタンからのクリックの場合にリセット）
    if (!button.dataset.resumeTime) {
      button.dataset.resumeTime = "0"; // 初期値は0
    }
    console.log('再生クリックイベント時data-resumeTime：', button.dataset.resumeTime);
    
    
    // イベントリスナーが多重で呼ばれないための分岐（ECMAScriptの仕様により必要ないかも）
    if (!slider.hasAttribute('data-listener-added')) {
      // slider.addEventListener('input', sliderIvent, console.log('スライダーイベント実行'));
      slider.addEventListener('input', (event) => {
        console.log('スライダーイベント実行', button);
        sliderIvent(event, button);
      });
      // イベントリスナー実行を表すdata属性をセット
      slider.setAttribute('data-listener-added', 'true')
    }

    if (!stopButton.hasAttribute('data-listener-added')) {
      // stopButton.addEventListener('click', stopAudio, console.log('一時停止イベント実行'));
      stopButton.addEventListener('click', () => {
        console.log('一時停止イベント実行', button);
        stopAudio(button);
      });
      // イベントリスナー実行を表すdata属性をセット
      stopButton.setAttribute('data-listener-added', 'true')
    }
    
    // 音声データurlを取得・デコード
    console.log('クリックボタン要素', button);
    playButton = button;
    const audioUrl = button.dataset.audioUrl
    console.log('audioURL:', audioUrl);
    const fetched = await fetchAudio(audioUrl);
    console.log('fetchedレスポンス', fetched);

    // 取得したデータを元に再生開始
    playAudio(fetched, button);
  })
  );


  // 再生・停止ボタンの表示処理
  function setButtonStatus(isPlaying) {
    // disabledの状態（真偽値）のデータを格納
    const buttonStatus = {
      playing: { playback: true, pause: false },
      pausing: { playback: false, pause: true }
    };
    let currentState;

    if(isPlaying == true) {
      console.log('ボタン: 再生中');
      currentState = buttonStatus.playing;
      // 全ての再生ボタン状態を非活性にする（他カードのクリック防止）
      playButtons.forEach((button) => button.disabled = true);
    } else {
      console.log('ボタン: 停止中');
      currentState = buttonStatus.pausing;
      // 全ての再生ボタン状態を活性にする（他カードの再生ボタンをクリックできるようにする）
      playButtons.forEach((button) => button.disabled = false);
    };

    // 状態を変更
    playButton.disabled = currentState.playback; //再生ボタン
    stopButton.disabled = currentState.pause; //一時停止ボタン
  }


  // function playingTime(audiContext, startTime) {
  //   return audioContext.currentTime - startTime;
  // }


  // 音声ファイルを読み込み
  async function fetchAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    // 音声ファイルのデータがデコードされ、WebaudioAPIで使用できるようになる
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('読み込み完了');
    return audioBuffer;
  }


  // 再生・停止
  async function playAudio(buffer, button) {
    if (buffer) {
      let resumeTime;
      console.log('再生開始:', buffer, button);
      currentBuffer = buffer;
      
      // ボタンのdata属性からresumeTimeを取得(数値に変換)
      resumeTime = parseFloat(button.dataset.resumeTime);
      console.log('セット後/resumeTime：', resumeTime);

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

      // ボタンの状態を更新
      setButtonStatus(true);

      // スライダーの更新
      updateProgress();
    }
  }

  async function stopAudio(button) {
    if (currentSource) {
      console.log('再生停止');

      // 一時停止時間を保存
      button.dataset.resumeTime = (audioContext.currentTime - startTime).toString();
      // resumeTime = audioContext.currentTime - startTime;
      console.log('一時停止時data-resumeTime：', button.dataset.resumeTime);

      // ソースを停止
      currentSource.stop();
      currentSource.onended = null; // onendedイベントリスナーを削除
      currentSource = null;

      // ボタン状態の更新
      setButtonStatus(false);
    }
  }


  // 録音コントローラー
  // 再生状況のリセット処理
  function resetPlayback() {
    slider.value = 0;
    playbackTime.textContent = '0:00';
    startTime = 0;
    // resumeTime = 0; // 再生が最後まで終了した場合にresumeTimeをリセット
    playButton.dataset.resumeTime = "0";
    currentSource = null; // 再生が最後まで終了した場合にsourceをリセット
    // startTime = audioContext.currentTime;
    console.log('再生リセット/再生ボタンDOM', playButton);
    console.log('data-resumeTime', playButton.dataset.resumeTime);

  }


  // 再生中のバーの進行処理
  function updateProgress() {
    if (currentSource && currentBuffer) {
      console.log('バー進行中');
      // 再生開始からの経過時間
      const elapsedTime = audioContext.currentTime - startTime;
      
      // スライダーをDOMに反映
      // 進捗率をスタイダーの値に反映・0〜100が返る [(経過時間 / 総再生時間)*100]
      slider.value = (elapsedTime / currentBuffer.duration) * 100;
      // 上記コードに変更 23/8/22
      // const progressRatio = elapsedTime / currentBuffer.duration;
      // slider.value = progressRatio * 100;


      // 経過時間をDOMに反映
      // 経過時間(秒)を60で割った切り捨て値を分単位として定義
      const minutes = Math.floor(elapsedTime / 60);
      // 経過時間(秒)を60で割った余りを秒単位として定義
      const seconds = Math.floor(elapsedTime % 60);
      // DOMに反映
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      // console.log(playbackTime.textContent);


      // 再生終了時のボタン・再生時間の設定
      if (elapsedTime >= currentBuffer.duration) {
        // ボタン状態の更新(停止)
        setButtonStatus(false);

        // 再生時間をリセット
        resetPlayback();
      } else {
        // アニメーションの更新
        requestAnimationFrame(updateProgress);
      }
    }
  }


  // ユーザーがスライダーをクリックした場合の更新処理
  async function sliderIvent(event, button) {
    console.log('スライダークリック時の更新', event, button);
    if (currentBuffer) {
      const sliderValue = event.target.value; // イベント発生時の現在値を取得
      const clickPositionRatio = sliderValue / 100; // 0から1の比率を算出
      const newTime = clickPositionRatio * currentBuffer.duration; // 現在の経過時間(秒)を算出
      // 秒・分単位ごとに値を算出
      const minutes = Math.floor(newTime / 60);
      const seconds = Math.floor(newTime % 60);
      
      button.dataset.resumeTime = newTime.toString();
      console.log('data-resumeTime', button.dataset.resumeTime);
      
      console.log('経過時間変更前', playbackTime.textContent);
      // 経過時間をDOMに更新
      playbackTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      console.log('経過時間変更後', playbackTime.textContent);


      // 音声が一時停止中であれば終了 / 音声が再生中であれば元の音声の停止＆更新した時間帯から再生開始
      if (!currentSource || currentSource.playbackState !== AudioBufferSourceNode.PLAYING_STATE) {
        return;
      } else if (currentSource) {
        currentSource.stop(); // 現在の音声sourceの停止
        currentSource.onended = null; // onendedイベントリスナーを削除
        playAudio(currentBuffer, button);
      }


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
  // function addEventListeners() {
  //   audioPlayback.addEventListener('click', playAudio);
  //   audioStop.addEventListener('click', stopAudio);
  // };


  ///// 関数・イベントの実行 /////
  // selectFetch();
  // addEventListeners();
  console.log('audio-playback実行');
});