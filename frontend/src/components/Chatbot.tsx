import React, { useState, useEffect } from 'react';
import { FaUser, FaRobot } from 'react-icons/fa'; // Icons for user and bot

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const StressChatbot: React.FC<{ selectedStress: string }> = ({ selectedStress }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Adding initial 4 bot messages directly into the chat
  useEffect(() => {
    const initialBotMessages = [
      { text: `Here are your stress metrics:`, sender: 'bot' },
      { text: `Temperature: 36°C`, sender: 'bot' }, // Hardcoded fall data
      { text: `Pulse: 72 bpm`, sender: 'bot' }, // Hardcoded fall data
      { text: `Ask me questions or give me further information, and I can assist you further!`, sender: 'bot' },
    ];

    setMessages(initialBotMessages); // Add these bot messages to the chat
  }, []);

  const handleSend = () => {
    if (inputText.trim()) {
      const userMessage = { text: inputText, sender: 'user' };
      const botReply = { text: `Reply to ${inputText}`, sender: 'bot' };
      
      setMessages((prevMessages) => [...prevMessages, userMessage, botReply]);
      setInputText(''); // Clear input after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(); // Send message on Enter key press
    }
  };

  const MessageBubble: React.FC<{ text: string; sender: 'user' | 'bot' }> = ({ text, sender }) => {
    const isUser = sender === 'user';
    return (
      <div style={isUser ? styles.userMessage : styles.botMessage}>
        {isUser ? (
          <>
            <div style={styles.messageContent}>{text}</div>
            <div style={styles.icon}><FaUser /></div>
          </>
        ) : (
          <>
            <div style={styles.icon}><FaRobot /></div>
            <div style={styles.messageContent}>{text}</div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        <div id="chat-container" style={styles.chatMessages}>
          {/* Display all messages */}
          {messages.map((message, index) => (
            <MessageBubble key={index} text={message.text} sender={message.sender} />
          ))}
        </div>
        <div style={styles.chatBar}>
          <input
            type="text"
            placeholder="Type your message..."
            style={styles.input}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSend}
            style={inputText.trim() ? styles.sendButtonActive : styles.sendButton}
            disabled={!inputText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#212121',
    width: '100%', // Make it take full width
    height: '100vh',
    display: 'flex',
    justifyContent: 'center', // Center the chat container horizontally
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '75%', // Adjust width for the main chat
    height: '100%',
    justifyContent: 'space-between',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '25px',
  },
  botMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '25px',
  },
  messageContent: {
    backgroundColor: '#E2BFD9',
    borderRadius: '10px',
    padding: '10px',
    maxWidth: '80%',
    wordBreak: 'break-word',
    color: '#674188',
  },
  chatBar: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #E2BFD9',
    paddingTop: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '20px',
    border: '1px solid #E2BFD9',
    marginRight: '10px',
    backgroundColor: '#2f2f2f',
    color: 'white',
  },
  sendButton: {
    backgroundColor: 'gray',
    color: '#F7EFE5',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    cursor: 'not-allowed',
    fontSize: '16px',
  },
  sendButtonActive: {
    backgroundColor: '#E2BFD9',
    color: 'black',
    border: 'none',
    borderRadius: '20px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '35px',
    height: '35px',
    backgroundColor: '#E2BFD9',
    borderRadius: '50%',
    marginLeft: '10px',
    marginRight: '10px',
  },
};

export default StressChatbot;
