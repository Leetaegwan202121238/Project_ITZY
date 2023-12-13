import React, {useState} from 'react';
import { Link } from 'react-router-dom'

import './Join.css';

const Join = () => {
    const [name, setName] =useState('');
    const [room, setRoom] = useState('');

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">join</h1>
                <div><input placeholder="닉네임" className="joinInput" type="text" onChange={(event)=> setName(event.target.value)} /></div>
                <div><input placeholder="방 번호" className="joinInput mt-20" type="text" onChange={(event)=> setRoom(event.target.value)} /></div>
                <Link onClick={event => (!name || !room) ? event.preventDefault():null} to={`/chat?name=${name}&room=${room}`}>
                    <button className="button mt-20" type="submit"> 입장 하기</button>
                </Link>
                <Link to="/rooms"> 
                    <button className="button mt-20" type="button"> 대기방 보기</button>
                </Link>  
            </div>
        </div>

        )
}

export default Join;