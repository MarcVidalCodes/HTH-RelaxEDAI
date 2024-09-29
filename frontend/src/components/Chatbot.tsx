import React, { useState, useEffect } from 'react';
import { FaUser, FaRobot } from 'react-icons/fa'; // Icons for user and bot
import SuggestedQuestions from './SuggestedQuestions';
import axios from 'axios';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const StressChatbot: React.FC<{ selectedStress: string }> = ({ selectedStress }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStress && selectedStress !== "Select a stress to get started") {
      try {
        const stress = JSON.parse(selectedStress);
        const messagesArray = [
          { text: `Here are your stress metrics:`, sender: 'bot' },
          { text: `Temperature: ${stress.temperature}`, sender: 'bot' },
          { text: `Pulse: ${stress.pulse}`, sender: 'bot' },
          { text: `Ask me questions or give me further information, and I can assist you further!`, sender: 'bot' },
        ];
        setMessages(messagesArray);
      } catch (error) {
        console.error('Error parsing selectedStress:', error);
        setMessages([{ text: 'There was an error processing your stress data.', sender: 'bot' }]);
      }
    }
  }, [selectedStress]);

  const handleSend = async () => {
    if (inputText.trim()) {
      const userMessage: Message = { text: inputText, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputText('');
      setLoading(true); 

      const token = localStorage.getItem('token');

      try {
        const response = await axios.post(
          'http://localhost:5001/api/analyze-stress',
          { stressData: selectedStress, question: inputText },
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
        const botMessage = { text: response.data.analysis, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error fetching response from backend:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'There was an error processing your request.', sender: 'bot' }
        ]);
      } finally {
        setLoading(false); 
      }

      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(); 
    }
  };

  const handleQuestionClick = async (question: string) => {
    const userMessage: Message = { text: question, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true); 

    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        'http://localhost:5001/api/analyze-stress',
        { stressData: selectedStress, question },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      const botMessage = { text: response.data.analysis, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error processing request:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'There was an error processing your request.', sender: 'bot' }
      ]);
    } finally {
      setLoading(false); 
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
          {loading && <div style={styles.loading}>Loading...</div>} {}
        </div>
        <SuggestedQuestions onQuestionClick={handleQuestionClick} selectedStress={selectedStress} />
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
    width: '100%', 
    height: '100vh',
    display: 'flex',
    justifyContent: 'center', 
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '75%', 
    height: '100%',
    justifyContent: 'space-between',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto' as const,
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
    wordBreak: 'break-word' as const,
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
    transition: 'background-color 0.3s',
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
  loading: {
    textAlign: 'center',
    color: '#E2BFD9',
  },
};

export default StressChatbot;
