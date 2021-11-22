const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
    host: '/',
    port: window.location.port,
    debug: true
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = new Map()

myPeer.on('open', id => {

    // console.log(this)

    socket.emit('join-otm-room', ROOM_ID, id)
    console.log('peer', id)
})

socket.on('user-otm-assigned', userId => {
    console.log('user-otm-assigned', userId)
    setTimeout(connectToNewUser, 1000, userId, myVideo.srcObject)
})

socket.on('otm-rearange', userId => {
    console.log('rearanged')
    setTimeout(connectToNewUser, 1000, userId, myVideo.srcObject)
})

socket.on('user-disconnected', userId => {

	if (peers[userId]) peers[userId].close()
    delete peers[userId]
})


myPeer.on('call', call => {

    console.log('called', call)
    call.answer()
    // console.log('trulala', myPeer.connections[0].getSenders())
    // myPeer.connections[Object.keys(myPeer.connections)[0]][0].peerConnection.getSenders()
    // console.log('trulala', myPeer.connections[Object.keys(myPeer.connections)[0]][0].peerConnection.getSenders())
    
    console.log('Peer connections', myPeer.connections)
    // const rtcrtpconnection = myPeer.connections[Object.keys(myPeer.connections)[0]][0].peerConnection
    
    call.on('stream', userVideoStream => {
        
        console.log('Peerjs stream', userVideoStream)
        for (const [key, value] of Object.entries(myPeer.connections)) {
            if (peers.has(key)){
                replaceStream(value[0].peerConnection, userVideoStream)
            }
        }

        addVideoStream(myVideo, userVideoStream)
    })
})

function replaceStream(peerConnection, mediaStream) {
    try {
        for(sender of peerConnection.getSenders()){
            if(sender.track.kind == "audio") {
                if(mediaStream.getAudioTracks().length > 0){
                    sender.replaceTrack(mediaStream.getAudioTracks()[0]);
                }
            }
            if(sender.track.kind == "video") {
                if(mediaStream.getVideoTracks().length > 0){
                    sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                }
            }
        }
    } catch (err) {
        console.error(err)
    }
    
}

function connectToNewUser(userId, stream) {
    
	const call = myPeer.call(userId, stream)
    console.log('trulala', myPeer.connections)
	peers.set(userId, call)
}

function addVideoStream(video, stream) {

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}