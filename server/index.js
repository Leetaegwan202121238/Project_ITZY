const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');


const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on('connection', (socket) =>{
    console.log(`We have a new connection.`);

    socket.on('join', ({name, room}, callback) => {
        console.log(name,room);

        const { user } = addUser({ id: socket.id, name, room });


        //방에 들어갔을 때, 들어간 사람의 클라이언트에만 송신
        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
                
        //방에 들어갔을 때, 방의 모든 클라이언트에 송신
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!`});

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room : user.room, users: getUsersInRoom(user.room)})
     
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        
        io.to(user.room).emit('message', { user: user.name, text: message});
        io.to(user.room).emit('message', { room: user.room, users: getUsersInRoom(user.room)});

    });

    socket.on('disconnect', () => {
        console.log(`User had left`);
    });
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));