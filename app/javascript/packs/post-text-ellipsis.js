document.addEventListener('DOMContentLoaded', function () {
  // 投稿一覧のカード内のテキスト要素をすべて取得
  const allPostCardText = document.querySelectorAll('.js-post-card-text');
  // console.log('allPostCardText', allPostCardText);

  // 初期状態でテキストが省略されているかを判定し結果をプール値で格納
  // この結果を元にテキスト全表示処理を実行するか判断する
  let isTruncated;

  // each処理でそれぞれイベントリスナーを定義することで、クリックイベントが発火した対象の要素に対してのみ処理を実行させる
  allPostCardText.forEach((atagText) => atagText.addEventListener('click', async function() {
    // ユーザーがクリックしたテキストを取得
    const cardText = atagText.querySelector('.card-text')
    // whiteSpaceの値を切り替えることでテキスト表示を変化させる
    let whiteSpaceValue = cardText.style.whiteSpace
    
    // 確認
    // console.log('atagText', atagText);
    // console.log('cardText', cardText);
    // console.log('whiteSpaceValue',whiteSpaceValue);
    // console.log('isTruncated', isTruncated);

    // 要素の幅を確認
    // if (cardText) {
    //   console.log('scrollWidth:', cardText.scrollWidth); // コンテンツ全体の幅を取得（折り返しを含まない）
    //   console.log('clientWidth:', cardText.clientWidth); // コンテンツ＋パディング（コンテナ内部幅）の横幅を取得（折り返しを含む）
    //   console.log('offsetWidth:', cardText.offsetWidth); // コンテンツ＋パディング＋ボーダー＋マージン＋スクロールバーの幅
    // } else {
    //     console.log('要素が見つかりません');
    // }
    
    // whiteSpaceValueの値が空かどうかで1回目か2回目以降の発火かを判定する
    if (!whiteSpaceValue) {
      // 省略されているテキストかを確認
      isTruncated = cardText.clientWidth < cardText.scrollWidth; // scrollWidthが長くなればテキストを省略していることがわかる
      console.log('isTruncated', isTruncated);

      // 省略されていれば処理を実行
      if (isTruncated) {
        // console.log('このテキストは省略されています。');
        whiteSpaceValue = 'normal';
        cardText.style.whiteSpace = whiteSpaceValue;
        console.log('whiteSpaceValue',whiteSpaceValue);
      } else {
        // console.log('このテキストは省略されていません。');
      }
    // isTruncatedの真偽によって、省略テキストのみ処理を実行させる
    } else if (isTruncated) {
      if (whiteSpaceValue === 'normal') {
        whiteSpaceValue = 'nowrap';
      } else if (whiteSpaceValue === 'nowrap') {
        whiteSpaceValue = 'normal';
      }
      cardText.style.whiteSpace = whiteSpaceValue;
      console.log('whiteSpaceValue',whiteSpaceValue);
    }

    // // whiteSpaceValue の初期値を設定
    // whiteSpaceValue = cardText.style.whiteSpace
    // // テキストの表示状態を変更
    // if (whiteSpaceValue === 'normal') {
    //   whiteSpaceValue = 'nowrap';
    // } else  {
    //   whiteSpaceValue = 'normal';
    // }
    // cardText.style.whiteSpace = whiteSpaceValue;
    // console.log('whiteSpaceValue',whiteSpaceValue);
  }));

  console.log('post-tex-ellipsis実行');
});