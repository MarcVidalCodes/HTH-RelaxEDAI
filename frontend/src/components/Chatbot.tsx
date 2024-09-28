import React from 'react';

const StressChatbot: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.text}>Hello World</h1>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#212121',
    width: '75%',
    padding: '20px',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 auto', // Center the container horizontally
    height: '100vh', // Make the container full height
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: '2rem',
  },
};

export default StressChatbot;
