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

navigator.mediaDevices.getUserMedia({
	video: true,
	// audio: true
}).then(stream => {

	console.log(stream.getVideoTracks().values())
	// addVideoStream(myVideo, stream)
	//socket.emit('create-room', ROOM_ID, id)
	socket.on('user-otm-assigned', userId => {
		console.log('user-otm-assigned', userId)
		// connectToNewUser(userId, stream)
		setTimeout(connectToNewUser, 1000, userId, stream)
	})

	socket.on('otm-rearange', userId => {
		console.log('rearanged')
		setTimeout(connectToNewUser, 1000, userId, stream)
	})
	
})

socket.on('user-disconnected', userId => {

	if (peers[userId]) peers[userId].close()
	delete peers[userId]
})

myPeer.on('open', id => {

	socket.emit('create-otm-room', ROOM_ID, id)
	console.log('peer', id)
})

socket.on('user-disconnected', userId => {
	console.log('dadisconnectdaaaaaaaaaaa')
	if (peers[userId]) peers[userId].close()
    delete peers[userId]
})

function connectToNewUser(userId, stream) {

	const call = myPeer.call(userId, stream)
	peers.set(userId, call)
}