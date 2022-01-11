const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));
io.on('connection', socket => {
    socket.emit('message', formatMessage('TseChat Bot','welcome to TseChat'));
    socket.broadcast.emit('message',formatMessage('TseChat Bot','A user has joined the chat'));
    socket.on('disconnect', () => {
        io.emit('message',formatMessage('TseChat Bot','A user has left the chat'));
    })
    socket.on('chatMessage', (msg) => {
        io.emit('message',msg);
    })
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));