import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';

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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 5, textAlign: 'center' }}>
      <h2>Create Account</h2>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" color="secondary" sx={{ mt: 2 }}>
        Register
      </Button>
      {responseMessage && <p>{responseMessage}</p>}
    </Box>
  );
}

export default CreateUser;
