(async () => {

    const socket = io('/')
    const videoGrid = document.getElementById('video-grid')
    const myPeer = new Peer({
        host: '/',
        path: '/peerjs',
        port: window.location.port,
        debug: true
    })
    
    // webcam
    const webcam = await navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true
    })

    const webcamClone = webcam.clone()

    // screen
    const screen = await navigator.mediaDevices.getDisplayMedia()

    // Display video
    const polygonVideo = document.getElementById('polygon-video')

    polygonVideo.srcObject = webcam
    polygonVideo.addEventListener('loadedmetadata', () => {
		polygonVideo.play()
	})

    const switchButton = document.getElementById('switcher')
    switchButton.onclick = switchFunc;

    setInterval(switchFunc, 750)

    let switchNum = 1;

    function switchFunc() {

        if (switchNum%2) {
            polygonVideo.srcObject = webcamClone
        } else {
            polygonVideo.srcObject = webcam
        }

        if (switchNum == 1) {
            polygonVideo.addEventListener('loadedmetadata', () => {
                console.log('switched')
                polygonVideo.play()
            })
        }

        switchNum++
    }
})()