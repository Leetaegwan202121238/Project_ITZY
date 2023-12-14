import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signin from './components/Signin/Signin';

// 다른 컴포넌트들을 여기서 import합니다.

/**
 *
 * 아 그니까 이 파일은 /join을 리디렉션 하면 join.js 컴포넌트를 보여줘라(렌더링?) 하는 거 지정하는 코드 적어놨음
 */
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate replace to="/signin" />} />
                <Route path="/signin" element={<Signin />} />
                {/* 로그인 성공 후 이동할 경로 */}
                <Route path="/join" element={<Join />} />
                <Route path="/chat" element={<Chat />} />
                {/* 다른 라우트들을 추가합니다. */}
            </Routes>
        </Router>
    );
}

// App을 수출할 준비가 됐다
export default App;