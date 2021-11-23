const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer({
	host: '/',
	path: '/peerjs',
	port: window.location.port,
	debug: true
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

document.getElementById('stream-share-url').textContent = window.location.href;

myPeer.on('open', peerId => {

	navigator.mediaDevices.getUserMedia({
		video: true,
		// audio: true
	}).then(stream => {
		addVideoStream(myVideo, stream)

		console.log('resolved')

		myPeer.on('call', call => {

			call.answer(stream)
			const video = document.createElement('video')
			call.on('stream', userVideoStream => {
				console.log('peerjs stream', userVideoStream)
				addVideoStream(video, userVideoStream)
			})
		})

		socket.emit('join-room', ROOM_ID, peerId)

		socket.on('user-connected', userId => {

			console.log('user connected', userId)
			connectToNewUser(userId, stream)
		})
	})

	socket.on('user-disconnected', userId => {

		if (peers[userId]) peers[userId].close()
	})

})

function connectToNewUser(userId, stream) {

	const call = myPeer.call(userId, stream)
	const video = document.createElement('video')
	call.on('stream', userVideoStream => {

		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		
		video.remove()
	})

	peers[userId] = call
}

function addVideoStream(video, stream) {

	const gridItem = document.createElement('div')
	gridItem.className = 'video-grid-item'

	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})

	gridItem.append(video)
	videoGrid.append(gridItem)
}