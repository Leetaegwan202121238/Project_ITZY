import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Rooms.css'; // 

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomsFromServer();
  }, []);

  const fetchRoomsFromServer = async () => {
    try {
      const response = await fetch('44.218.36.252:5000/rooms');
      const data = await response.json(); 
      setRooms(data); // 데이터를 상태로 설정
    } catch (error) {
      console.error('방 목록을 불러오는 중 오류 발생:', error);
    }
  };

  const goBack = () => {
    navigate(-1);
  }

  return (
    <div className="rooms-container">
      <button className="title-button">사용 가능한 방</button>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room} className="room-item">
            <button disabled className="room-button">{room}</button>
          </li>
        ))}
      </ul>
      <button className="back-button" onClick={goBack}>뒤로 가기</button>
    </div>
  );
};

export default Rooms;