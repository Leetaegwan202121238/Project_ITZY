import React from 'react';


import './Message.css';

    const Message = ( {message: { text } }  ) => {
        return (
            <div className="messageBox">
                <p className="messageText">{text}</p>
            </div>
        );
}

export default Message;