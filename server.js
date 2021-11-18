const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const roomStreamers = {}
const TreeModel = require('tree-model')
const tree = new TreeModel()
const util = require('util')

app.set('view engine', 'ejs')
app.use(express.static('public'))

// Handle index
app.get('/', (req, res) => {

	res.redirect(`/conference/${uuidV4()}`)
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
})

app.get('/otm/:room', (req, res) => {

	res.render('otm-watcher', { roomId: req.params.room })
})

// Room trees
const roomTrees = {}

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

		socket.join(roomId)
		const root = roomTrees[roomId]

		const parentCandidate = root.first(function (node) {
			return node.children.length < 2;
		})

		const thisPeer = tree.parse(new Peer(userId, socket.id))
		parentCandidate.addChild(thisPeer)

		// let mates = socket.adapter.rooms.get(roomId).size
		// if (mates == 1) roomStreamers[roomId] = socket.id
		io.to(thisPeer.parent.model.socketId).emit('user-otm-assigned', userId)
		// socket.to(roomId).emit('user-connected', userId)
		// io.to(socket.id).emit('callback', roomStreamers[roomId])
		// io.to(roomId).emit('callback', socket.adapter.rooms.get(roomId).size)

		socket.on('disconnect', () => {
			socket.broadcast.to(roomId).emit('user-disconnected', userId)
		})
	})

	socket.on('create-otm-room', (roomId, userId) => {

		roomTrees[roomId] = tree.parse(new Peer(userId, socket.id));

		roomStreamers[roomId] = socket.id
		console.log(roomStreamers)
		socket.on('disconnect', () => {
			delete roomStreamers[roomId]
		})
	})
})

function Peer (peerId, socketId) {
	this.peerId = peerId,
	this.socketId = socketId
}

server.listen(3000)