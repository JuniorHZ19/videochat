const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let myPeerId;

// Obtener el identificador de la sala de la URL
const roomId = window.location.pathname.substring(1);

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
    
}

function connectToNewUser(userId, stream) {
   
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('signal', {
                type: 'candidate',
                candidate: event.candidate,
                from: myPeerId,
                to: userId
            });
        }
    };

    peerConnection.ontrack = event => {
        
        if (!document.getElementById(userId)) {  // Verificar si el video ya existe
            const video = document.createElement('video');
            video.id = userId; 
            video.srcObject = event.streams[0];
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
            videoGrid.append(video);
        }
    };

    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
    });

    peerConnection.createOffer().then(offer => {
        return peerConnection.setLocalDescription(offer);
    }).then(() => {
        socket.emit('signal', {
            type: 'offer',
            offer: peerConnection.localDescription,
            from: myPeerId,
            to: userId
        });
    });

    peers[userId] = peerConnection;


   
}


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    socket.on('user-connected', userId => {

        if (!peers[userId]) {
            connectToNewUser(userId, stream);
           
        }

    });

    socket.on('signal', async data => {
        if (data.from === myPeerId) return;

        if (!peers[data.from]) {
            await connectToNewUser(data.from, stream);
        }

        const peerConnection = peers[data.from];

        if (data.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('signal', { type: 'answer', answer, from: myPeerId, to: data.from });
        } else if (data.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === 'candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });

    socket.on('user-disconnected', userId => {
    
            peers[userId].close();
            delete peers[userId];
            // Remove the corresponding video element
            const video = document.getElementById(userId);
            if (video) {
                video.remove();
            }
        
    });

    myPeerId = socket.id;
    socket.emit('join-room', roomId, myPeerId);
    addVideoStream(myVideo, stream);
});

