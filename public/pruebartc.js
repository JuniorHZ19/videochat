




peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

        .then(() => peerConnection.createAnswer())

        .then((answer) => peerConnection.setLocalDescription(answer))

        .then(() => {
            // Enviar la respuesta al par remoto
            console.log(peerConnection.localDescription)
        })
       

peerConnection.addEventListener('icecandidate', event => {

     if (event.candidate) {

           console.log(event.candidate)

     }

     });


const configuration = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    };

    
const peerConnection = new RTCPeerConnection(configuration);

navigator.mediaDevices.getUserMedia({ video: true, audio: true })

  .then(stream => {
    stream.getTracks().forEach(track => {

      peerConnection.addTrack(track, stream);
      
    });
  })
 

  peerConnection.addEventListener('track', event => {

    const stream = event.streams[0];
    
    // Usa el stream remoto (por ejemplo, muestra el video en un elemento <video>)
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    document.body.appendChild(videoElement);

  });