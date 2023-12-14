import React from 'react';

import './Input.css';

//채팅창 내부의 치고 갱신되는 부분
const Input = ( { message, setMessage, sendMessage, word } ) => (
    <form className="form">
        <input
            className="input"
            type="text"
            placeholder="채팅을 입력하세요"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyPress={event => event.key === 'Enter' ? sendMessage(event): null}
        />
        <button className="sendButton" onClick={(event) => sendMessage(event)}>Send</button>
        <button>이전 단어: {word} </button>
    </form>
)

export default Input;