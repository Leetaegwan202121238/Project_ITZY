import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

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
        if(myIndex === 0){
         socket.emit('gameStart', { room });
         setIsGameStarted(true);
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

    
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name ={name} />               
                <Input message = {message} setMessage = {setMessage} sendMessage={sendMessage} />
                <button onClick={handleGameStart} style={{ backgroundColor: myIndex === 0 && !isGameStarted ? '#3399FF' : 'grey' }}>게임 시작</button>
                <p id="timer">10</p>
            </div>
        </div>
    )
}

export default Chat;