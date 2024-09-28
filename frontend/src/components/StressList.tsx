import React from 'react';
import StressInstance from './StressInstance';
import logo from '../assets/logo.png';

const StressList: React.FC<{ onSelectStress: (stress: string) => void }> = ({ onSelectStress }) => {
  return (
    <div style={styles.container}>
      {<img src={logo} alt="Logo" style={styles.logo} /> }
      <StressInstance onSelectStress={onSelectStress} />
      
      <div style={styles.logoutContainer}>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#171717',
    width: '25%',
    padding: '20px',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    marginTop: '20px',
    width: '100%',
    marginBottom: '20px',
  },
  logoutContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
};

export default StressList;
