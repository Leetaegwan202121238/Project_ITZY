import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

//소리 불러오기
import correct from '../../bgm/correct.mp3';
import wrong from '../../bgm/incorrect.mp3';
import roundEnd from '../../bgm/roundEnd.mp3';

//이미지 불러오기
import player from '../../icons/player.png';



import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;

const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    //사람 몇명 들어왔나
    const [numberOfUsers, setNumberOfUsers] = useState(0);

    //점수 및 경험치용
    const [score, setScore] = useState(0);

    const correctSound = new Audio(correct);
    const wrongSound = new Audio(wrong);
    const roundEndSound = new Audio(roundEnd);
    const playerimage = new Image(player);
    
    //게임 시작되면 true로 바꿀 변수(게임 중인지 아닌지 확인하려고)
    const [isGameStarted, setIsGameStarted] = useState(false);
    
    //차례때문에 만든 인덱스
    const [myIndex, setMyIndex] = useState(null);
    //채팅 활성화
    const [chatEnabled, setChatEnabled] = useState(false);

    const enableChatInput = () => {
        setChatEnabled(true);
    };
    
    const disableChatInput = () => {
        setChatEnabled(false);
    };

    //서버로 둘 aws public 주소
    const ENDPOINT = 'localhost:5000';

    //socket을 통해 name과 room url정보 전달
    useEffect(() => {
        const { name, room } = queryString.parse(window.location.search);

        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);

        socket.emit('join', { name, room }, (index) => {
            setMyIndex(index);
        });

        return () => {
            socket.emit('disconnect');

            socket.off();
        }

        console.log(socket);
    }, [ENDPOINT, window.location.search]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages((messages) => [...messages, message]);
            console.log("Updated messages: ", messages); // 메시지 상태 업데이트 확인
        })
    },[]);

    useEffect(() => {
        console.log("Current messages: ", messages); // 현재 메시지 상태 확인
    }, [messages]);

    

    //메시지 보내기
    const sendMessage = (event) => {
        //새로고침 되는 것 막기
        event.preventDefault();

        if(message != null) {
            socket.emit('sendMessage', message, ()=> setMessage(''));
        }
    }

    //game 시작
    const handleGameStart = () => {
        if(myIndex === 0 ){
            if(isGameStarted === false){
                socket.emit('gameStart', { room });
                setIsGameStarted(true);
            }else{
                alert("지금은 게임 중입니다");
            }

        }else {
            alert("방장만이 게임시작이 가능합니다");
        }
    };

    //차례랑 timer기능
    useEffect(() => {
        if (!socket) return;
    
        const timerHandler = (data) => {
            document.getElementById('timer').innerText = data.timeLeft;
        };
    
        const turnHandler = (data) => {
            if (data.currentPlayerIndex === myIndex) {
                // It's my turn.
                enableChatInput();
            } else {
                // It's not my turn.
                disableChatInput();
            }
        };
    
        socket.on('timeLeft', timerHandler);
        socket.on('turnStart', turnHandler);
    
        return () => {
            socket.off('timeLeft', timerHandler);
            socket.off('turnStart', turnHandler);
        };
    }, [socket, myIndex]);

    //게임 종료 이벤트 받기
    useEffect(() => {
    socket.on('gameover', () => {

        //서버에 점수 보내기   
        socket.emit('sendScore', { score });
        setScore(0);

        //게임상태 초기화
        setIsGameStarted(false);
    });
    },[score]);


    //효과음 넣기
    useEffect(() => {
    socket.on('correctSignal', ({ score }) => {
        correctSound.play(); 

        setScore(prevScore => prevScore + score);
    });
    socket.on('wrongSignal', function() {
        wrongSound.play(); 
    });
    socket.on('roundEnd', function() {
        roundEndSound.play(); 
    });
    },[]);

    //사람 몇명 들어왔나
    useEffect(() => {
        socket.on('usersCount', (count) => {
            setNumberOfUsers(count);
        });
    
        return () => {
            socket.off('usersCount');
        };
    }, []);


    
    
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name ={name} />               
                <Input message = {message} setMessage = {setMessage} sendMessage={sendMessage} />
                <button onClick={handleGameStart} style={{ backgroundColor: myIndex === 0 && !isGameStarted ? '#3399FF' : 'grey' }}>게임 시작</button>
                <p id="timer">10</p>

                {/* Render images */}
                {Array(numberOfUsers).fill().map((_, i) => (
                <img key={i} src={player} alt="Player" />
            ))}
            </div>
        </div>
    )
}

export default Chat;