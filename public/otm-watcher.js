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

// webcam
let webcam;
navigator.mediaDevices.getUserMedia({
    video: true,
    // audio: true
}).then(function(stream){
    webcam = stream
})

myPeer.on('open', peerId => {

    socket.emit('join-otm-room', ROOM_ID, peerId)
    document.getElementById('stream-peer-id').textContent = peerId
    console.log('peer', peerId)
})

socket.on('user-otm-assigned', userId => {
    console.log('user-otm-assigned', userId)
    // console.log(myVideo.srcObject)
    connectToNewUser(userId, myVideo.srcObject)
})

socket.on('otm-rearange', userId => {
    console.log('rearanged')
    // console.log(myVideo.srcObject)
    connectToNewUser(userId, myVideo.srcObject)
})

socket.on('user-disconnected', userId => {

	if (peers[userId]) peers[userId].close()
    delete peers[userId]
})

myPeer.on('call', call => {

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

        addVideoStream(myVideo, userVideoStream, true)
    })


    // Pertaxa find me
    // ai ar ra anu
    // ar shveba close-ze 
    // da raghacas arasworad vidzaxebt mgoni
    // eg rom naxo tu shedzleb dghes itogshi :D 
    call.on('close', () => {
    
        console.log('daqoluza')
    })

})

document.getElementById('replica').onclick = replica
function replica(){

    for (const [key, value] of Object.entries(myPeer.connections)) {
        if (peers.has(key)){
            replaceStream(value[0].peerConnection, webcam)
        }
    }
}

function replaceStream(peerConnection, mediaStream) {
    try {
        console.log('j', peerConnection)
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
    // console.log('trulala', myPeer.connections)
    // console.log('trulala2', myPeer.connections[0].getSenders())
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