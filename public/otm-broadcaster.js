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
const peers = new Map()

const roomUrl = window.location.href.replace(/\/[^\/]*$/, '/' + ROOM_ID)
document.getElementById('stream-share-url').textContent = roomUrl;
document.getElementById('stream-share-url').onclick = function () {

	alert('The room URL was copied to you clipboard.')
	navigator.clipboard.writeText(roomUrl);
}


myPeer.on('open', peerId => {
	navigator.mediaDevices.getUserMedia({
		video: true,
		// audio: true
	}).then(stream => {

		console.log('gotStream')
		addVideoStream(myVideo, stream, true)
		// addVideoStream(myVideo, stream)
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

	socket.emit('create-otm-room', ROOM_ID, peerId)
	document.getElementById('stream-peer-id').textContent = peerId
	console.log('peer', peerId)
})

socket.on('user-disconnected', userId => {
	console.log('disconnect')
	if (peers[userId]) peers[userId].close()
    delete peers[userId]
})

function connectToNewUser(userId, stream) {

	console.log('called')
	const call = myPeer.call(userId, stream)
	peers.set(userId, call)
}

function addVideoStream(video, stream, selected) {

	const gridItem = document.createElement('div')
	gridItem.className = 'video-grid-item'
	if (selected) gridItem.className = 'video-grid-item selected'

	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})

	gridItem.append(video)
	videoGrid.append(gridItem)
}