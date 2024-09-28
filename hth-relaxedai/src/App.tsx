import { useState } from 'react';
import StressList from './components/StressList'; // Import StressList
import Chatbot from './components/Chatbot'; // Import Chatbot

function App() {
  const [selectedStress, setSelectedStress] = useState<string | null>(null);

  const handleSelectStress = (stress: string) => {
    setSelectedStress(stress); // Update selected stress instance
  };

  return (
    <div className="app-container">
      {/* StressList on the left */}
      <div className="left-panel">
        <StressList onSelectStress={handleSelectStress} />
      </div>

      {/* Chatbot on the right */}
      <div className="right-panel">
        <Chatbot selectedStress={selectedStress} />
      </div>
    </div>
  );
}

export default App;
