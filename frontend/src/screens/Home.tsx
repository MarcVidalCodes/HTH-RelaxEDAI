import React, { useState, useContext, useEffect } from 'react';
import StressList from '../components/StressList';
import Chatbot from '../components/Chatbot';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home: React.FC = () => {
  const [selectedStress, setSelectedStress] = useState<string | null>(null);
  const { isAuthenticated, logout, token } = useContext(AuthContext)!; // Get token from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }

    const fetchStressData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/stress-data', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to Authorization header
          },
        });
        console.log('Stress data:', response.data); // Handle the stress data here
      } catch (error) {
        console.error('Failed to fetch stress data:', error);
      }
    };

    fetchStressData();
  }, [isAuthenticated, token, navigate]);

  return (
    <div style={styles.appContainer}>
      <StressList onSelectStress={setSelectedStress} />
      <Chatbot selectedStress={selectedStress || 'Select a fall to get started'} />
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
};

export default Home;
