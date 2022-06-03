# flamenco_session

### ■ サービス概要
3行で

すでにある演奏動画（音声）に合わせて録音・録画した
投稿を合体させることで、誰でも気軽にオンライン上で
セッションが実現できるサービスです。

### ■メインのターゲットユーザー
- フラメンコの練習生（歌、踊り、ギターなど）
- 合わせることで、何倍も楽しめる楽器をやっている人
- 音楽、フラメンコに興味がある人


### ■ユーザーが抱える課題
フラメンコは歌、踊り、ギターが、一つのテーマ（曲種）を元に即興的に「合わせる」といったことが、醍醐味。
ただプロや熟練者でもない生徒やアマチュアの私たちは、なかなか日常的に「合わせる」といこと自体が、少し敷居が高いように感じています。

以下例
- 歌、踊り、ギターの他教室の生徒同士が身近に交流する機会が思いのほか少ない。
- 一曲まるまる踊れる、歌える、演奏できるようになるまで、ある程度の時間がかかる。
- 教室でのレッスンや発表会以外で、個人間で「合わせる」といった経験をあまりしたことがない。または合わせ方がよくわからない。
- お互いのレベル間がわからないため、練習をお願いしずらい。（お互い気を遣ってしまう）
- 地域差によってフラメンコをやる人が少なく、リアルで「合わせる」こと自体がが難しい。
- 時間や場所の制約、または場所代、交通費等の問題



### ■解決方法
- オンラインによって全国中の知らない人同士でも、お互いの演奏や踊りの動画を投稿し合い、合成させることで、擬似的にもフラメンコならではのセッションを可能にする。
- セッションを通して新たな交流のきっかけを作る。（今まで繋がっていなかった踊り手や歌い手、ギターリスト等を繋げる）
- 共通の曲パートごとの投稿を可能にすることで、一曲完成させないと「合わせられない」といった敷居を下げる。
- 新たに練習したい曲やパートを投稿の中から探すことができる。いろんなパターンを学べる。

オンラインを通して、日常の練習から「合わせる」ことに慣れることで、経験有無問わず、より多くの人がフラメンコに触れる機会を提供できないかと考えています。

### ■実装予定の機能（以下の例は実際のアプリの機能から一部省略しています）
### 基本機能
録音・録画機能
- 歌、踊り、演奏を録画（録音）する

動画・音声合成機能
- 事前にある演奏データと新たに録画、録音したデータを合成し、同時に再生できるようにする。（一つの楽曲にする）
- 最大4つまで同時に合成できる

投稿機能
- 録画・録音したデータを投稿できる
- 合成したデータを投稿できる
- 投稿一覧を表示する

ユーザー機能
- ユーザーのCRUD機能


### 追加機能
いいね機能
- 投稿に対していいねできる

コメント機能
- 投稿に対してコメントできる

検索機能
- 曲、パート、演奏ジャンルごとに検索が可能

公開・非公開機能
- ユーザーは自身の投稿を公開・非公開できる

シェア機能
- SNSシェアできる。


### ■なぜこのサービスを作りたいのか？
###　フラメンコユーザーに対して
- フラメンコという共通の音楽ジャンルを通して、プロアマの経歴や上手い下手関係なく、また歌、ギター、踊りの教室の垣根を越えて、気軽に交流ができるきっかけ作りをしていきたい。
- フラメンコの醍醐味である「合わせる」といった部分の敷居をなるべく下げることで、練習生やアマチュアである私たちも、フラメンコをより一層楽しめる環境づくりをしていきたい。
- オンライン上のセッションをきっかけに、最終的にはリアルなセッションに繋がる導線を作っていきたい。
- 今取り組んでいる、または先生にレッスンを受けた内容を、すぐに試せる場をオンライン上に提供したい。（共通の曲種を習ってる生徒同士で試験的に合わせてみる、パートごとに合わせてみる）
- 地域差によってリアルで「合わせる」ことが難しい練習生や、フラメンコ仲間が少ない人達の交流のきっかけを提供したい。
- はじめからセッションありきの環境だからこそ、さまざま方達と「合わせる」ことで、お互いのレベルアップに繋げたい。

###　音楽経験者・未経験者に対して
- フラメンコをやったことがない人でも、フラメンコといたジャンルを認知してもらうきっかけを作りたい。
- 演奏そのものやセッションの楽しさを気軽に体験して味わってもらいたい。


### ■スケジュール
企画〜技術調査：6/3〆切
README〜ER図作成：6/5 〆切
メイン機能実装：6/5 - 7/10
β版をRUNTEQ内リリース（MVP）：7/10〆切
本番リリース：7月末