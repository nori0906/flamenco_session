main()

async function main () {
  const buttonStart = document.querySelector('#buttonStart')
  const buttonStop = document.querySelector('#buttonStop')
  const player = document.querySelector('#player')

  const stream = await navigator.mediaDevices.getUserMedia({ // <1>
    video: false,
    audio: true,
  })

  if (!MediaRecorder.isTypeSupported('audio/webm')) { // <2>
    console.warn('audio/webm is not supported')
  }

  const mediaRecorder = new MediaRecorder(stream, { // <3>
    mimeType: 'audio/webm',
  })

  buttonStart.addEventListener('click', () => {
    mediaRecorder.start() // <4>
    buttonStart.setAttribute('disabled', '')
    buttonStop.removeAttribute('disabled')
  })
  
  buttonStop.addEventListener('click', () => {
    mediaRecorder.stop() // <5>
    buttonStart.removeAttribute('disabled')
    buttonStop.setAttribute('disabled', '')
  })
  
  
  
  mediaRecorder.addEventListener('dataavailable', event => { // <6>
    player.src = URL.createObjectURL(event.data) //ブラウザのプレイヤーにセットするため
    
    //base64形式に変換しサーバーに送る処理
    let reader = new FileReader(); 
    reader.readAsDataURL(event.data);
    reader.onloadend = () => {
      base64 = reader.result; 
      base64 = base64.split(',')[1];
      console.log(base64);
      
      axios({
        method: 'post',
        url: 'http://localhost:3000/blob',
        data: {
          voice: base64
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      });
    }
  })
  
  
  // コラボ用の録音機能
  const collaboButtonStart = document.querySelector('#collaboButtonStart')
  const collaboButtonStop = document.querySelector('#collaboButtonStop')
  const collaboPlayer = document.querySelector("#collaboPlayer");
  
  
  collaboButtonStart.addEventListener('click', () => {
    collaboPlayer.play()
    mediaRecorder.start() // <4>
    collaboButtonStart.setAttribute('disabled', '')
    collaboButtonStop.removeAttribute('disabled')
  })
  
  collaboButtonStop.addEventListener('click', () => {
    mediaRecorder.stop() // <5>
    collaboButtonStart.removeAttribute('disabled')
    collaboButtonStop.setAttribute('disabled', '')
  })
  
  mediaRecorder.addEventListener('dataavailable', event => { // <6>
    collaboPlayer.src = URL.createObjectURL(event.data) //ブラウザのプレイヤーにセットするため
    
    //base64形式に変換しサーバーに送る処理
    let reader = new FileReader(); 
    reader.readAsDataURL(event.data);
    reader.onloadend = () => {
      base64 = reader.result; 
      base64 = base64.split(',')[1];
      console.log(base64);
      
      axios({
        method: 'post',
        url: 'http://localhost:3000/blob',
        data: {
          voice: base64
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
      });
    }
  })
}