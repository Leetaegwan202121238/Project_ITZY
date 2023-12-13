import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

import './Signin.css'; // CSS 파일을 import합니다.

function Signin() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    const handleSignin = async (event) => {
        event.preventDefault();
        console.log('Client : /process/login 호출한다');

        try {
            const response = await axios.post('http://localhost:5000/process/login', {id, pw: password});
            console.log('Client : /process/login 호출했다');

            // 응답 상태 코드 확인
            if (response.status === 200) {
                console.log('로그인 성공:', response.data);
                // 로그인 성공, join 페이지로 이동
                navigate('/join');
            }
        } catch (error) {
            // 네트워크 오류 또는 서버 오류 처리
            console.error('로그인 에러:', error);
            if (error.response && error.response.status === 401) {
                // 오류 처리, 예를 들어 알림 메시지를 보여주는 등
                alert('아이디나 비밀번호가 올바르지 않습니다.');
            } else {
                // 다른 HTTP 상태 코드나 네트워크 오류에 대한 처리
                alert('로그인을 처리할 수 없습니다. 나중에 다시 시도해주세요.');
            }
        }
    };

    const handleSignup = async (event) => {
        event.preventDefault();
        console.log('Client : /process/signup 호출한다');

        try {
            const response = await axios.post('http://localhost:5000/process/signup', {id, pw: password});
            console.log('Client : /process/signup 호출했다');

            if (response.status === 201) {
                alert('회원가입이 완료되었습니다. 로그인해주세요.');
                setIsRightPanelActive(false); // 회원가입 후 로그인 패널로 이동
            }
        } catch (error) {
            alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="wrapper"> {/* 이 div에 wrapper 클래스를 적용합니다. */}
            <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignup}>
                        <h1 className="font-main">Create Account</h1>
                        <div className="social-links">
                            <div>
                                <a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a>
                            </div>
                            <div>
                                <a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a>
                            </div>
                            <div>
                                <a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a>
                            </div>
                        </div>
                        <span>or use your email for registration</span>
                        <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} required/>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                               required/>
                        <button type="submit" className="form_btn">Sign Up</button>
                    </form>
                </div>


                <div className="form-container sign-in-container">
                    <form onSubmit={handleSignin}>
                        <h1 className="font-main">Sign In</h1>
                        <div className="social-links">
                            <div>
                                <a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a>
                            </div>
                            <div>
                                <a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a>
                            </div>
                            <div>
                                <a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a>
                            </div>
                        </div>
                        <span>or use your account</span>
                        <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)}
                               required/>
                        <input type="password" placeholder="Password" value={password}
                               onChange={(e) => setPassword(e.target.value)} required/>
                        <button type="submit" className="form_btn">Sign In</button>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="font-main">Welcome user!</h1>
                            <hr/>
                            <p className="font-sub">ITZY의 세계에 오신 것을 환영합니다!</p>
                            <p className="font-sub">단어의 마스터가 되어 보세요.</p>
                            <button className="overlay_btn" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="font-main">Hello, user!</h1>
                            <hr/>
                            <p className="font-sub">이미 ITZY 멤버이신가요? </p>
                            <p className="font-sub">그럼 단어의 신세계로 로그인하세요!</p>
                            <button className="overlay_btn" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin;