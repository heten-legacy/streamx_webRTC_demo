const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const roomStreamers = {}

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    let mates = socket.adapter.rooms.get(roomId).size
    if (mates == 1) roomStreamers[roomId] = socket.id
    io.to(roomStreamers[roomId]).emit('user-connected', userId)
    // socket.to(roomId).emit('user-connected', userId)
    // io.to(socket.id).emit('callback', socket.adapter.rooms.get(roomId).size, roomStreamers[roomId])
    // io.to(roomId).emit('callback', socket.adapter.rooms.get(roomId).size)

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId)
    })
  })
})


server.listen(3000)