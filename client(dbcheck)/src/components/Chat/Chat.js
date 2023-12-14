import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';

//소리 불러오기
import correct from '../../bgm/correct.mp3';
import wrong from '../../bgm/incorrect.mp3';
import roundEnd from '../../bgm/roundEnd.mp3';
import maintheme from '../../bgm/main_theme.mp3';

//이미지 불러오기
import player from '../../icons/player.png';

import './Chat.css';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import ScoreBoard from '../ScoreBoard/ScoreBoard';


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
    
    //최종 점수 게시판용
    const [finalScores, setFinalScores] = useState(null);


    //현재 단어
    const [TotalScore, setTotalScore] = useState(null);
    const [Totalplay, setTotalplay] = useState(null);
    const [currentWord, setCurrentWord] = useState('');


    //노래용
    const correctSound = new Audio(correct);
    const wrongSound = new Audio(wrong);
    const roundEndSound = new Audio(roundEnd);
    const playerimage = new Image(player);
    roundEndSound.volume = 0.1;
    //게임 시작되면 true로 바꿀 변수(게임 중인지 아닌지 확인하려고)
    const [isGameStarted, setIsGameStarted] = useState(false);
    
    //차례때문에 만든 인덱스
    const [myIndex, setMyIndex] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);

    
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

        socket.emit('reqtotscore', name, (TotalScore1) => {
            setTotalScore(TotalScore1['total_score']);
        });

        socket.emit('reqtotplay', name, (Totalplay) => {
            setTotalplay(Totalplay['total_play']);
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
            setCurrentPlayer(data.currentPlayer);
            if (data.currentPlayer === myIndex) {
                // It's my turn.
                enableChatInput();
                setIsMyTurn(true);
            } else {
                // It's not my turn.
                disableChatInput();
                setIsMyTurn(false);
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

    const handleGameOver = (scores) => {
        // 서버에서 받은 점수를 저장
        setFinalScores(scores);

        //게임상태 초기화
        setScore(0);
        setIsGameStarted(false);
    };

    //서버에 점수 보내기   
    socket.emit('sendScore', { score });
    socket.on('gameover', handleGameOver);

    // Cleanup
    return () => {
        socket.off('gameover', handleGameOver);
    };

    },[score]);


    //효과음 넣기
    useEffect(() => {
        const handleCorrectSignal = ({ score, currentWord }) => {
            correctSound.play(); 
            setScore(prevScore => prevScore + score);
            setCurrentWord(currentWord);
        };
        const handleWrongSignal = () => {
            wrongSound.play(); 
        };
        const handleRoundEnd = () => {
            roundEndSound.play(); 
        };
    
        socket.on('correctSignal', handleCorrectSignal);
        socket.on('wrongSignal', handleWrongSignal);
        socket.on('roundEnd', handleRoundEnd);
            
        //이벤트 핸들러 끊어질 떄 삭제해서 버그방지
        return () => {
            socket.off('correctSignal', handleCorrectSignal);
            socket.off('wrongSignal', handleWrongSignal);
            socket.off('roundEnd', handleRoundEnd);
        };
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

    useEffect(() => {
        socket.on('current', ({ currentWord }) => {
            setCurrentWord(currentWord);
            console.log(currentWord)
        });
    
        return () => {
            socket.off('current');
        };
    }, []);

    
    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name ={name} />               
                <Input message = {message} setMessage = {setMessage} sendMessage={sendMessage} word={currentWord}/>
                <button onClick={handleGameStart} style={{ backgroundColor: myIndex === 0 && !isGameStarted ? '#3399FF' : 'grey' }}>게임 시작</button>
                {/* <p>{`지금은 ${currentPlayer +1}번의 차례입니다!`}</p>
                <p>{`당신은 ${myIndex + 1}번입니다! 잘 기억하세요`}</p>
                {isMyTurn && <p> 당신 차례입니다! </p>} */}
                <p id="timer">{isMyTurn ? '남은 시간: 10' : ''}</p>
                <p>Score : {score}</p>
                {/* <p className='p'>total_score : {TotalScore}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;total_play : {Totalplay}</p> */}
            </div>
            <ScoreBoard gameOverScores={finalScores} />
        </div>
    )
}

export default Chat;
