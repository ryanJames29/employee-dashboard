import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './login';
import CreateUser from './createUser';

function App() {
  return (
    <Router>
      <nav style={{ textAlign: 'center', margin: '20px' }}>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
        <Link to="/register">Create Account</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CreateUser />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
