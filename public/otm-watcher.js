const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
    host: '/',
    port: '3001',
    debug: true
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

myPeer.on('open', id => {

    socket.emit('join-otm-room', ROOM_ID, id)
    console.log('Joined')
})

socket.on('callback', (broadcasterID) => {
    
    socket.on('disconnect', () => {
        delete roomStreamers[roomId]
    })
})

socket.on('user-otm-assigned', userId => {
    console.log('user-otm-assigned', userId)
    console.log(saveReceivingStream)
    setTimeout(connectToNewUser, 1000, userId, saveReceivingStream)
})

let saveReceivingStream; 
myPeer.on('call', call => {

    console.log('called')
    call.answer()
    call.on('stream', userVideoStream => {
        console.log('peerjs stream', userVideoStream)
        saveReceivingStream = userVideoStream.clone();
        addVideoStream(myVideo, userVideoStream)
    })
})

function connectToNewUser(userId, stream) {

	const call = myPeer.call(userId, stream)
	peers[userId] = call
}

function addVideoStream(video, stream) {

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}