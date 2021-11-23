const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const roomsData = {}
const TreeModel = require('./tree')
const tree = new TreeModel()
const { ExpressPeerServer  } = require('peer')
const util = require('util')

app.set('port', process.env.PORT || 3000);

const peerServer = ExpressPeerServer(server, {})
app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
app.use(express.static('public'))

function RoomInfo (broadcaster, rootNode, treeView) {
	this.broadcaster = broadcaster
	this.rootNode = rootNode
	this.treeView = treeView
}

// Handle index
app.get('/', (req, res) => {

	res.render('home')
})

// Conference routes
app.get('/conference', (req, res) => {

	res.redirect(`/conference/${uuidV4()}`)
})

app.get('/conference/:room', (req, res) => {

	res.render('conference', { roomId: req.params.room })
})

// Broadcast routes
app.get('/otm/broadcast', (req, res) => {
	res.render('otm-broadcaster', { roomId: uuidV4() })
	// res.render('otm-broadcaster', { roomId: uuidV4() })
})

// app.get('/otm/tree', (req, res) => {

// 	res.render('tree')
// })

app.get('/otm/tree/:room', (req, res) => {

	res.render('tree', {roomId: req.params.room})
})

app.get('/otm/tree/', (req, res) => {

	res.render('tree', {roomId: req.params.room})
})

app.get('/otm/:room', (req, res) => {

	res.render('otm-watcher', { roomId: req.params.room })
})

// Socket connectivity
io.on('connection', socket => {

	socket.on('join-room', (roomId, userId) => {

		socket.join(roomId)
		socket.to(roomId).emit('user-connected', userId)
		
		socket.on('disconnect', () => {
			socket.broadcast.to(roomId).emit('user-disconnected', userId)
		})
	})

	socket.on('join-otm-room', (roomId, userId) => {
		if(!roomsData[roomId]) return
	
		socket.join(roomId)
		console.log('client', userId, 'joined room:', roomId)
		const root = roomsData[roomId].rootNode
		if (!root) return

		const parentCandidate = root.first(function (node) {
			return node.children.length < 1;
		})

		const thisPeer = tree.parse(new Peer(userId, socket.id))
		parentCandidate.addChild(thisPeer)

		io.to(thisPeer.parent.model.socketId).emit('user-otm-assigned', userId)
		// let mates = socket.adapter.rooms.get(roomId).size
		// if (mates == 1) roomStreamers[roomId] = socket.id
		// socket.to(roomId).emit('user-connected', userId)
		// io.to(socket.id).emit('callback', roomStreamers[roomId])
		// io.to(roomId).emit('callback', socket.adapter.rooms.get(roomId).size)

		sendTree(roomId)

		socket.on('disconnect', () => {

			socket.broadcast.to(roomId).emit('user-disconnected', userId)

			if (thisPeer.children.length) io.to(thisPeer.parent.model.socketId).emit('otm-rearange', thisPeer.children[0].model.peerId)
			thisPeer.remove()
			
			sendTree(roomId)
		})
	})

	socket.on('create-otm-room', (roomId, userId) => {

		socket.join(roomId)

		roomsData[roomId] = new RoomInfo(socket.id, tree.parse(new Peer(userId, socket.id)), null)

		sendTree(roomId)
		
		socket.on('disconnect', () => {

			sendTree(roomId)
			delete roomsData[roomId]
		})
	})
})


function Peer (peerId, socketId) {
	this.peerId = peerId,
	this.socketId = socketId
}

function sendTree (roomId) {

	if (!roomsData[roomId]) return
	const ourlyTree = ourlyTreeer(roomsData[roomId].rootNode)
	io.in(roomId).emit('otm-tree-changed', JSON.stringify(ourlyTree))
	
	function ourlyTreeer (tree) {
		
		const ourlyTree = []
		tree.walk(function (node) {
	
			const ourlyNode = {
				id: node.model.peerId,
				parentId: node.isRoot() ? null : node.parent.model.peerId,
				peer: new Peer(node.model.peerId, node.model.socketId),
				index: node.getIndex()
			}
	
			ourlyTree.push(ourlyNode)
		})
	
		return ourlyTree
	}
}

server.listen(process.env.PORT || 3000)