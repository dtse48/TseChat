const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getUser,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'public')));
io.on('connection', socket => {
    socket.on('join', ({username,room}) => {
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        socket.emit('message', formatMessage('TseChat Bot','Welcome to TseChat!'));
        socket.broadcast.to(user.room).emit('message',formatMessage('TseChat Bot',user.username +' has joined the chat!'));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    socket.on('chatMessage', (msg) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('message',formatMessage('TseChat Bot',user.username+' has left the chat.'));
        }
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});
const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));