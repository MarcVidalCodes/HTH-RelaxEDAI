import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('User logged out');
    
    navigate('/');
  };

  return (
    <button onClick={handleLogout} style={styles.button}>
      <span style={styles.text}>Logout</span>
    </button>
  );
};

const styles = {
  button: {
    backgroundColor: '#E2BFD9',
    color: '#212121',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  text: {
    fontFamily: 'Roboto, sans-serif',
  },
};

export default LogoutButton;