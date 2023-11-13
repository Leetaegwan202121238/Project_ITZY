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

    //aws 주소
    const ENDPOINT = 'localhost:5000';

    //socket을 통해 name과 room url정보 전달
    useEffect(() => {
        const { name, room } = queryString.parse(window.location.search);

        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);

        socket.emit('join', { name, room });

        return () => {
            socket.emit('disconnect');

            socket.off();
        }

        console.log(socket);
    }, [ENDPOINT, window.location.search]);

    //실시간 메시지
    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message]);
        })
    },[messages]);

    //메시지 보내기
    const sendMessage = (event) => {
        event.preventDefault();

        if(message) {
            socket.emit('sendMessage', message, ()=> setMessage(''));
        }
    }

    console.log(message, messages);
    
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name ={name} />               
                <Input message = {message} setMessage = {setMessage} sendMessage={sendMessage} />
            </div>
        </div>
    )
}

export default Chat;