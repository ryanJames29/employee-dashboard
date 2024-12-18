import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import background from './background.jpg';
import { Link } from 'react-router-dom';

function CreateUser() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/create', {
        username,
        password,
      });
      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage('Registration failed');
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh', // Full viewport height
        display: 'flex',
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column', // Stack form elements vertically
          alignItems: 'center', // Center form elements horizontally
          gap: 2, // Space between form elements
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // White background with slight transparency
          borderRadius: '8px', // Rounded corners
          padding: '20px', // Add padding inside the form container
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // Optional shadow for better visual separation
          textAlign: 'center',
        }}
      >
        <h2>Create Account</h2>
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth // Ensures the text field spans the full container width
          sx={{ maxWidth: 300 }} // Limit the width for better alignment
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ maxWidth: 300 }}
        />
        <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2, maxWidth: 300 }}>
          Register
        </Button>
        {responseMessage && <p>{responseMessage}</p>}
      </Box>

      {/* Links Section */}
      <Box
        sx={{
          position: 'absolute', // Position at the bottom of the page
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <Link to="/register" style={{ marginRight: '10px' }}>Create Account</Link>
        <Link to="/login">Login</Link>
      </Box>
    </Box>
  );
}

export default CreateUser;
