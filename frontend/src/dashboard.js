import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Fix import for jwtDecode
import { Menu, MenuItem, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import background from './background.jpg';
import { Box } from '@mui/material';

function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [records, setRecords] = useState([]);
  const [action, setAction] = useState('clock_in'); // Default action is clock in
  const [username, setUserName] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // Dropdown menu anchor
  const navigate = useNavigate(); // For logout and navigation

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded Token:', decoded);
        if (decoded && decoded.id) {
          setUserId(decoded.id);
          setUserName(decoded.username);
        } else {
          console.error('User ID is missing in the token payload.');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    } else {
      console.error('No token found in localStorage.');
    }
  }, []);

  const fetchRecords = async () => {
    if (!userId) {
      console.error('User ID is missing, cannot fetch records.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5001/time-records/${userId}`);
      console.log('Fetched records:', response.data.records);
      setRecords(response.data.records);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecords(); // Fetch records when userId changes
    }
  }, [userId]);

  const handleClockAction = async () => {
    if (!userId) {
      alert('User ID is not available');
      return;
    }

    console.log('Sending clock action:', { user_id: userId, action });

    try {
      const response = await axios.post('http://localhost:5001/record-time', {
        user_id: userId,
        action,
      });

      alert(response.data.message); // Show confirmation message
      setAction(action === 'clock_in' ? 'clock_out' : 'clock_in'); // Toggle action
      fetchRecords(); // Refresh records after clock action
    } catch (error) {
      console.error('Error recording time:', error.response?.data || error.message);
      alert('Error recording time. Please try again.');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token from storage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div
        style={{
            backgroundImage: `url(${background})`, // Set background image
            backgroundSize: 'cover',              // Ensure the image covers the whole area
            backgroundPosition: 'center',         // Center the image
            minHeight: '100vh',                   // Ensure full viewport height
            display: 'flex',
            flexDirection: 'column',             // Stack items vertically
            alignItems: 'center',                // Center horizontally
            padding: '10px',
            position: 'relative',                // Allows absolute positioning of dropdown
        }}
        >
        {/* Dropdown Menu */}
        <div
            style={{
            position: 'absolute',
            top: '10px',
            right: '10px', // Position the dropdown in the top-right corner
            }}
        >
            <div>
            <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon fontSize="large" />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem
                onClick={() => {
                    handleMenuClose();
                    handleLogout();
                }}
                >
                Logout
                </MenuItem>
            </Menu>
            </div>
        </div>

        {/* Dashboard Header */}
        <div
            style={{
            marginTop: '50px', // Add spacing from the top of the screen
            textAlign: 'center', // Center align text
            }}
        >
            {username && <h1>{username} Employee Dashboard</h1>}
            {userId && <p>Employee ID: {userId}</p>}
        </div>

        {/* Clock In/Out Button */}
        <button
            onClick={handleClockAction}
            style={{
            marginTop: '20px', // Space below the header
            padding: '10px 20px',
            fontSize: '16px',
            }}
        >
            {action === 'clock_in' ? 'Clock In' : 'Clock Out'}
        </button>

        {/* Time Records Table */}
        <h2 style={{ marginTop: '20px' }}>Your Time Records</h2>
        <table
            border="1"
            style={{
            margin: '20px auto',
            textAlign: 'left',
            width: '80%',
            }}
        >
            <thead>
            <tr>
                <th>ID</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
            </tr>
            </thead>
            <tbody>
            {records.map((record) => (
                <tr key={record.id}>
                <td>{record.id}</td>
                <td>
                    {record.clock_in_time
                    ? new Date(record.clock_in_time).toLocaleString()
                    : 'N/A'}
                </td>
                <td>
                    {record.clock_out_time
                    ? new Date(record.clock_out_time).toLocaleString()
                    : 'N/A'}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  );
}

export default Dashboard;
