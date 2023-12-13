const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom, getUniqueRooms, editlasts } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
let RoomsList = getUniqueRooms();
const games = {};

//지금 들어가있는 단어
let currentWords = {};

//리눅스에선 이거 추가해야함
//const fetch = require('node-fetch'); 

const key="88BF1D891A90A3C4F5075AFD1DA41F76";
const methodType = "&type_search=view&req_type=json&method=TARGET_CODE&q=";


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
        //방에 몇명있나
        const numberOfUsers = usersInRoom.length;
        io.to(user.room).emit('usersCount', numberOfUsers);

    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const game = games[user.room];
        
        var url="https://stdict.korean.go.kr/api/search.do?certkey_no=6202&key="+key+methodType+message;

        fetch(url)
        .then((response)=>response.text())
        .then(data=>{
            if (game && (game.players[game.currentPlayerIndex].id === user.id)) {
                if(data!="" && (currentWords[user.room] === '' || currentWords[user.room][currentWords[user.room].length - 1] === message[0])){
                    const apiresult=JSON.parse(data);
                    var ran=apiresult.channel.total;
                    const rannum=Math.floor(Math.random()*ran);
                    io.to(user.room).emit('message', { user: user.name, text: message});
                    io.to(user.room).emit('message', { user: user.name, text: "뜻 : " + apiresult.channel.item[rannum].sense.definition})
                    endTurn(user.room);
                    console.log(message)
                    currentWords[user.room] = message;

                    //정답 소리내기 및 점수 보내기
                    const remainingTime = getRemainingTime();
                    const messageScore = message.length * remainingTime;
                    io.to(user.room).emit('correctSignal', { score: messageScore });
                    
                }
                else{
                    callback('표준어가 아닙니다.')
                    //틀렸을 때
                    io.to(user.room).emit('wrongSignal');
                }
            } else if (game) {
                callback('게임이 진행중이지만 당신의 차례가 아닙니다.');
            } else {
                callback('게임이 아직 시작되지 않았습니다.');
            }
        })
    });

    socket.on('disconnect', () => {
        console.log(`User had left`);
    });

    //게임 시작
    socket.on('gameStart', ({ room }) => {
        currentWords[room] = '';

        games[room] = {
            currentPlayerIndex: 0, 
            players: getUsersInRoom(room),
            timer: null,
            timeLeft: 10,
            //라운드 수
            round: 0, 
        };
        startTurn(room);
    });
    
    //시작 된뒤에 로직
    function startTurn(room) {
        const game = games[room];
        if (!game) return;
    
        clearTimeout(game.timer);
        
        //남은 시간 보여주려고
        game.timeLeft = 10;

        //차례가 됬을 떄 시간타이머 기능
        game.timer = setInterval(() => {
            game.timeLeft--;
            io.to(room).emit('timeLeft', { timeLeft: game.timeLeft  });
    
            if (game.timeLeft <= 0) {
                clearInterval(game.timer);
                endRound(room);
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
    
    //점수 계산용 시간 가져오기
    function getRemainingTime(room) {
        const game = games[room];
        if (!game) return 0;
    
        return game.timeLeft;
    }

    //라운드 종료
    function endRound(room) {
        const game = games[room];
        if (!game) return;
    
        io.to(room).emit('roundEnd');
        currentWords[room] = '';
        game.round += 1;
        console.log(game.round);

        if (game.round >= 2) {
            console.log('Game over');
            delete games[room];  // 게임 상태 삭제
            io.to(room).emit('gameover');
            game.currentPlayerIndex = 0;
            return;
        }else{
        setTimeout(() => {
            startTurn(room);
        }, 5000); // 5초 후에 새로운 라운드 시작
    }
    }


    //점수 DB에 보내기
    socket.on('sendScore', ({ score }) => {
        console.log(`Score : ${score}`);
    });
    
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));