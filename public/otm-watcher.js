const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
    host: '/',
    port: '3001',
    debug: true
})
const myVideo = document.createElement('video')
myVideo.muted = true

myPeer.on('open', id => {

    socket.emit('join-otm-room', ROOM_ID, id)
    console.log('sent ment')
})

socket.on('callback', (broadcasterID) => {
    
    socket.on('disconnect', () => {
        delete roomStreamers[roomId]
    })
})

myPeer.on('call', call => {

    console.log('called')
    call.answer()
    call.on('stream', userVideoStream => {
        console.log('peerjs stream', userVideoStream)
        addVideoStream(myVideo, userVideoStream)
    })
})

function addVideoStream(video, stream) {

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}