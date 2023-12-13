import React from 'react';

import closeIcon from '../../icons/closeIcon.png'
import onlineIcon from '../../icons/onlineIcon.png'


import './InfoBar.css';

//chat.js 에서 보내준 room 정보 동적 연결, 접속 중 이미지
const InfoBar = ( { room } ) => (
    <div className="infoBar">
        <div className="leftInnerContainer">
            <img className="onlineIcon" src={onlineIcon} alt="online image" />
            <h3>{room}</h3> 
        </div>
        <div className="rightInnerContainer">
            <a href="/"><img src={closeIcon} alt="close image" /></a>
        </div>
    </div>
)

export default InfoBar;