import { useState } from 'react';
import StressList from './components/StressList'; // Import StressList
import Chatbot from './components/Chatbot'; // Import Chatbot

function App() {
  const [selectedStress, setSelectedStress] = useState<string | null>(null);

  // Function to handle stress selection from StressList
  const handleSelectStress = (stress: string) => {
    setSelectedStress(stress); // Update selected stress instance
  };

  return (
    <div style={styles.appContainer}>
      {/* Render StressList and pass the handler */}
      <StressList onSelectStress={handleSelectStress} />

      {/* Render Chatbot and pass the selected stress */}
      <Chatbot selectedStress={selectedStress} />
    </div>
  );
}

// Inline styles
const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
};

export default App;
