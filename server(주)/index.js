const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {addUser, removeUser, getUser, getUsersInRoom} = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router.js');

const mysql = require('mysql');  //주정
const bcrypt = require('bcrypt'); //주정
const path = require('path'); //주정

/**
 * http 서버에 express서버랑 socket.io 서버 올림
 */
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors()); // CORS 오류를 방지하기 위해 사용
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 사용 //주정
app.use(router);
app.use(express.urlencoded({extended: true}));

const pool = mysql.createPool({
    connectionLimit: 10, // 동시에 처리할 수 있는 연결 수
    host: 'localhost', // 데이터베이스 호스트
    user: 'user', // 데이터베이스 사용자 이름
    password: 'user', // 데이터베이스 비밀번호
    database: 'sign_upin' // 데이터베이스 이름
});

// 회원가입 처리
app.post('/process/signup', async (req, res) => {
    //const { id, pw } = req.body;

    const paramId = req.body.id;
    const paramPw = req.body.pw;

    try {
        const hashedPw = await bcrypt.hash(paramPw, 10);
        pool.query('INSERT INTO `users` (id, pw) VALUES (?, ?)', [paramId, hashedPw], (error, results) => {
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

/**
 * io 통신 코드(io.emit => 말하는 거 // io.on => 듣는 거)
 */
//바로 아래 코드 socket변수에는 연결된 사람 정보 들어감
io.on('connection', (socket) => {
    console.log(`We have a new connection.`);

    socket.on('join', ({name, room}, callback) => {
        console.log(name, room);

        const {user} = addUser({id: socket.id, name, room});


        //최초로 방에 들어갔을 때, 들어간 사람의 클라이언트에만 송신
        socket.emit('message', {user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});

        //사람이 있는 방에 들어갔을 때, 방의 모든 클라이언트에 송신
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name}, has joined!`});

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})

    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
        io.to(user.room).emit('message', {room: user.room, users: getUsersInRoom(user.room)});

    });

    socket.on('disconnect', () => {
        console.log(`User had left`);
    });
});


server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));