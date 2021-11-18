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

navigator.mediaDevices.getUserMedia({
	video: true,
	// audio: true
}).then(stream => {

	// addVideoStream(myVideo, stream)
	//socket.emit('create-room', ROOM_ID, id)
	socket.on('user-otm-connected', userId => {
		console.log('user-otm-connected', userId)
		// connectToNewUser(userId, stream)
		setTimeout(connectToNewUser, 1000, userId, stream)
	})
})

myPeer.on('open', id => {

	socket.emit('create-otm-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
	
	const call = myPeer.call(userId, stream)
	peers[userId] = call
}