const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom, getUniqueRooms } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
let RoomsList = getUniqueRooms();
const games = {};


app.use(router);
app.use(cors());
app.get('/rooms', (req, res) => {
    res.send(RoomsList);
  });

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
        
        const usersInRoom = getUsersInRoom(user.room);
        const myIndex = usersInRoom.findIndex(u => u.id === user.id);
        callback(myIndex); 

        RoomsList = getUniqueRooms();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const game = games[user.room];

        //게임 중인지, 차례가 맞는지 로직
        if (game && game.players[game.currentPlayerIndex].id === user.id) {
            io.to(user.room).emit('message', { user: user.name, text: message});
            endTurn(user.room);
        } else if (game) {
            callback('게임이 진행중이지만 당신의 차례가 아닙니다.');
        } else {
            callback('게임이 아직 시작되지 않았습니다.');
        }
    });


    socket.on('disconnect', () => {
        console.log(`User had left`);
    });

    //게임 시작
    socket.on('gameStart', ({ room }) => {


        games[room] = {
            currentPlayerIndex: 0, 
            players: getUsersInRoom(room),
            timer: null,
        };
        startTurn(room);
    });
    
    //시작 된뒤에 로직
    function startTurn(room) {
        const game = games[room];
        if (!game) return;
    
        clearTimeout(game.timer);
        
        //남은 시간 보여주려고
        let timeLeft = 10;

        //차례가 됬을 떄 시간타이머 기능
        game.timer = setInterval(() => {
            timeLeft--;
            io.to(room).emit('timeLeft', { timeLeft });
    
            if (timeLeft <= 0) {
                clearInterval(game.timer);
                endTurn(room);
            }
        }, 1000);
        
        io.to(room).emit('turnStart', { currentPlayer: game.currentPlayerIndex });
    }

    //턴 넘길 때
    function endTurn(room) {
        const game = games[room];
        if (!game) return;
    
        clearTimeout(game.timer);
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

       
        console.log(`Ending turn, next player is ${game.currentPlayerIndex}`);
        startTurn(room);
        
    }

    function endGame(room) {
        const game = games[room];
        if (!game) return;
    
        console.log(`Game ended in room ${room}`);
        // 게임 상태 초기화
        setIsGameStarted(false);
        setTurnCount(0);

        clearInterval(game.timer);
    }
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));