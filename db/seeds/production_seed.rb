user = User.create!(
  [
    { name: 'tanaka', email: 'test@example.com', password: 'password', password_confirmation: 'password' },
    { name: 'yamada', email: 'test1@example.com', password: 'password', password_confirmation: 'password' },
    { name: 'yoshida', email: 'test2@example.com', password: 'password', password_confirmation: 'password' }
  ]
)

post = Post.create!(
  [
    {
      title: 'ブレリアのリズム',
      body: 'ギターでリズムだしてみました！',
      ext_type: "webm",
      user_id: user[0].id
    },
    {
      title: 'パルマの練習',
      body: 'ブレリアのパルマ練習中...',
      ext_type: "webm",
      user_id: user[1].id
    },
    {
      title: 'フラメンコ未経験です。',
      body: '手拍子叩いてみました！フラメンコになっているのかな？',
      ext_type: "webm",
      user_id: user[2].id
    }
  ]
)

post[0].voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')
post[1].voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')
post[2].voice.attach(io: File.open(Rails.root.join('public/test.mp3')), filename: 'test.mp3')