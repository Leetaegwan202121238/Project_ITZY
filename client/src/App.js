import React from 'react';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import Rooms from './components/Rooms';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Join />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/Rooms" element={<Rooms />} />
        </Routes>
    </Router>
);

export default App;