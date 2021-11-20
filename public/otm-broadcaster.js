const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
	host: '/',
	port: process.env.PORT || 3000,
	debug: true
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

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

myPeer.on('open', id => {

	socket.emit('create-otm-room', ROOM_ID, id)
	console.log('peer', id)
})

function connectToNewUser(userId, stream) {

	const call = myPeer.call(userId, stream)
	peers[userId] = call
}