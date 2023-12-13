import React, { useState, useEffect } from 'react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRoomsFromServer();
  }, []);

  const fetchRoomsFromServer = async () => {
    try {
      const response = await fetch('http://localhost:5000/rooms');
      const data = await response.text(); // 텍스트로 받음
      setRooms(data.split(',')); // 텍스트를 원하는 형식으로 처리, 예시로 쉼표(,)로 구분된 데이터를 배열로 변환
    } catch (error) {
      console.error('방 목록을 불러오는 중 오류 발생:', error);
    }
  };

  return (
    <div>
      <h2>사용 가능한 방</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room}>{room}</li>
        ))}
      </ul>
    </div>
  );
};

export default Rooms;