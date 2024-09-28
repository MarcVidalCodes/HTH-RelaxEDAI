import React, { useState } from 'react';
import { FaUser, FaRobot } from 'react-icons/fa'; // Icons for user and bot

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const StressChatbot: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

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
    width: '75%',
    padding: '20px',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '35px',
    width: '100%',
    height: '90%',
    justifyContent: 'space-between',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    marginLeft: '30px',
    marginBottom: '10px',
    padding: '10px',
  },
  userMessage: {
    display: 'flex',
    marginRight: '30px',
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
