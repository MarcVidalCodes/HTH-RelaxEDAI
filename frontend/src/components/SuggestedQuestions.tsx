import React, { useState, useEffect } from 'react';

const initialQuestion = 'Analyze my stress levels';
const additionalQuestions = [
  'Can you suggest a meditation routine?',
  'How can I be less stressed in my next study session',
  'Suggest study techniques to reduce stress',
];

const SuggestedQuestions: React.FC<{ onQuestionClick: (question: string) => void, selectedStress: string }> = ({ onQuestionClick, selectedStress }) => {
  const [showInitialQuestion, setShowInitialQuestion] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    setShowInitialQuestion(true);
    setQuestions([]);
  }, [selectedStress]);

  const handleInitialClick = () => {
    setShowInitialQuestion(false);
    setQuestions(additionalQuestions);
    onQuestionClick(initialQuestion);
  };

  const handleClick = (question: string) => {
    setQuestions((prevQuestions) => prevQuestions.filter(q => q !== question));
    onQuestionClick(question);
  };

  return (
    <div style={styles.container}>
      {showInitialQuestion ? (
        <div 
          style={styles.question} 
          onClick={handleInitialClick}
        >
          {initialQuestion}
        </div>
      ) : (
        questions.map((question, index) => (
          <div 
            key={index} 
            style={styles.question} 
            onClick={() => handleClick(question)}
          >
            {question}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '10px',
  },
  question: {
    color: '#9e9e9e',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '5px',
    transition: 'background-color 0.2s',
    fontSize: '14px', 
    backgroundColor: '#212121', 
    marginBottom: '5px', 
  },
};

export default SuggestedQuestions;