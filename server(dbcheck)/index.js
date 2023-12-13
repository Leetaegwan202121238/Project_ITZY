const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom, getUniqueRooms, editlasts } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router.js');

const mysql = require('mysql');  //주정
// const bcrypt = require('bcrypt'); //주정
const path = require('path'); //주정

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors()); // CORS 오류를 방지하기 위해 사용
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 사용 //주정
app.use(router);
app.use(express.urlencoded({extended: true}));

let RoomsList = getUniqueRooms();
const games = {};
const fetch = require('node-fetch');

const key="88BF1D891A90A3C4F5075AFD1DA41F76";
const methodType = "&type_search=view&req_type=json&method=TARGET_CODE&q=";

const pool = mysql.createPool({
    connectionLimit: 10, // 동시에 처리할 수 있는 연결 수
    host: 'localhost', // 데이터베이스 호스트
    user: 'root', // 데이터베이스 사용자 이름
    password: 'root', // 데이터베이스 비밀번호
    database: 'sign_upin' // 데이터베이스 이름
});

// 회원가입 처리
app.post('/process/signup', async (req, res) => {
    //const { id, pw } = req.body;

    const paramId = req.body.id;
    const paramPw = req.body.pw;

    try {
        // const hashedPw = await bcrypt.hash(paramPw, 10);
        pool.query('INSERT INTO `users` (id, pw) VALUES (?, ?)', [paramId, paramPw], (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// 로그인 처리
app.post('/process/login', (req, res) => {
    console.log('Server : /process/login 호출 받음');

    const paramId = req.body.id;
    const paramPw = req.body.pw;

    pool.query('SELECT `pw` FROM `users` WHERE `id` = ?;', [paramId], async (error, results) => {
        console.log('Server: 데이터베이스 비교함');
        if (error) {
            return res.status(500).json({error});
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const match = await bcrypt.compare(paramPw, results[0].pw);
        if (!match) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        res.status(200).json({ message: 'Logged in successfully' });
    });
});



app.use(router);
app.use(cors());
app.get('/rooms', (req, res) => {
    res.send(RoomsList);
  });

io.on('connection', (socket) =>{

    console.log(`We have a new connection.`);

    socket.on('join', ({name, room}, callback) => {
        console.log(name,room);
                
        //지금 들어가 있는 단어
        let currentWord = '';

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
        
        var url="https://stdict.korean.go.kr/api/search.do?certkey_no=6202&key="+key+methodType+message;

        fetch(url)
        .then((response)=>response.text())
        .then(data=>{
            if (game && game.players[game.currentPlayerIndex].id === user.id) {
                if(data!="" && (currentWord === '' || currentWord[currentWord.length - 1] === message[0])){
                    const apiresult=JSON.parse(data);
                    var ran=apiresult.channel.total;
                    const rannum=Math.floor(Math.random()*ran);
                    io.to(user.room).emit('message', { user: user.name, text: message});
                    io.to(user.room).emit('message', { user: user.name, text: "뜻 : " + apiresult.channel.item[rannum].sense.definition})
                    endTurn(user.room);
                    console.log(message)
                    currentWord = message;

                }
                else{
                    callback('표준어가 아닙니다.')
                }
            } else if (game) {
                callback('게임이 진행중이지만 당신의 차례가 아닙니다.');
            } else {
                callback('게임이 아직 시작되지 않았습니다.');
            }
        })

        //게임 중인지, 차례가 맞는지 로직
        // if (game && game.players[game.currentPlayerIndex].id === user.id) {
        //     io.to(user.room).emit('message', { user: user.name, text: message});
        //     endTurn(user.room);
        // } else if (game) {
        //     callback('게임이 진행중이지만 당신의 차례가 아닙니다.');
        // } else {
        //     callback('게임이 아직 시작되지 않았습니다.');
        // }
    });


    socket.on('disconnect', () => {
        console.log(`User had left`);
    });

    //게임 시작
    socket.on('gameStart', ({ room }) => {
        currentWord = '';

        games[room] = {
            currentPlayerIndex: 0, 
            players: getUsersInRoom(room),
            timer: null,
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
        game.round += 1;

        if (game.round >= 3) {
            console.log('Game over');
            delete games[room];  // 게임 상태 삭제
            io.to(room).emit('gameover');
            return;
        }
       
        console.log(`Ending turn, next player is ${game.currentPlayerIndex}`);
        startTurn(room);
        
    }

    function endGame(room) {
        const user = getUser(socket.id);
        const game = games[room];
        if (!game) return;
    
        console.log(`Game ended in room ${room}`);
        // 게임 상태 초기화
        setIsGameStarted(false);
        round = 0;
        currentWord = '';

        clearInterval(game.timer);
    }
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
