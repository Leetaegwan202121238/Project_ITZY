import React from 'react';
import { useState } from 'react';

import './ScoreBoard.css'; 

function ScoreBoard({ gameOverScores }) {

  const [showModal, setShowModal] = useState(true); // 모달창의 보이기/숨기기 상태

  const handleClose = () => {
    setShowModal(false); // 닫기 버튼 클릭 시 모달창 숨기기
  };

    return (
        <div>
          {showModal && gameOverScores && (
            <div className="modal">
              <div className="modal-content">
                <h1>게임 종료</h1>
                {Object.entries(gameOverScores).map(([player, score]) => (
                  <p key={player}>{player}: {score}점</p>
                ))}
            
                <button onClick={handleClose}>닫기</button>
              </div>
            </div>
          )}
        </div>
      );
}

export default ScoreBoard;