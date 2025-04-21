import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, set, serverTimestamp, get } from 'firebase/database';
import { database } from '../config/firebase';
import '../styles/games.css';

const generateRandomUsername = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Wise', 'Swift', 'Gentle', 'Bright', 'Calm', 'Cool', 'Wild'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Lion', 'Wolf', 'Fox', 'Bear', 'Hawk', 'Owl'];
  const randomNumber = Math.floor(Math.random() * 1000);
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}${randomNumber}`;
};

// Helper function to validate username format
const isValidUsername = (username) => {
  if (!username) return false;
  
  // Check if it follows our adjective+noun+number format
  // This is a simple check - it should contain at least one letter and one number
  return /[A-Za-z]/.test(username) && /[0-9]/.test(username) && username.length > 5;
};

const Games = () => {
  const [activeGame, setActiveGame] = useState('phishing');
  const [gameState, setGameState] = useState({
    phishing: { score: 0, completed: false },
    password: { score: 0, completed: false },
    puzzle: { score: 0, completed: false },
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username] = useState(() => {
    // Check if we already have a username in localStorage and validate it
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername && isValidUsername(savedUsername)) {
      console.log('Using saved username:', savedUsername);
      return savedUsername;
    }
    
    // Generate a new username and save it to localStorage
    const newUsername = generateRandomUsername();
    console.log('Generated new username:', newUsername);
    localStorage.setItem('chatUsername', newUsername);
    return newUsername;
  });
  const reconnectTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize Firebase connection and leaderboard listener
  const initializeFirebase = async () => {
    try {
      console.log('Initializing Firebase leaderboard connection...');
      setIsLoading(true);
      setError(null);

      // Use a single gameLeaderboard node in Firebase
      const leaderboardRef = ref(database, 'gameLeaderboard');
      
      // Check if leaderboard node exists
      try {
        const snapshot = await get(leaderboardRef);
        if (!snapshot.exists()) {
          await set(leaderboardRef, {});
        }
      } catch (error) {
        console.error('Error checking leaderboard node:', error);
      }

      // Set up real-time listener
      const unsub = onValue(leaderboardRef, (snapshot) => {
        console.log('Received leaderboard data');
        setIsLoading(false);
        setError(null);

        const data = snapshot.val();
        if (data) {
          // Process and filter for current active game
          const allEntries = Object.entries(data)
            .map(([key, value]) => ({
              ...value,
              id: key
            }));
          
          // Filter for current active game and sort by score
          const gameEntries = allEntries
            .filter(entry => entry.game === activeGame)
            .sort((a, b) => b.score - a.score);
          
          setLeaderboard(gameEntries);
        } else {
          setLeaderboard([]);
        }
      }, (error) => {
        console.error('Database error:', error);
        setError('Connection lost. Attempting to reconnect...');
        scheduleReconnect();
      });

      // Store the unsubscribe function
      unsubscribeRef.current = unsub;
    } catch (error) {
      console.error('Setup error:', error);
      setError('Failed to connect to leaderboard. Attempting to reconnect...');
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect to leaderboard...');
      initializeFirebase();
    }, 5000);
  };

  // Initialize Firebase on component mount
  useEffect(() => {
    initializeFirebase();
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Update leaderboard when active game changes
  useEffect(() => {
    // Unsubscribe from previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    initializeFirebase();
  }, [activeGame]);

  // Function to submit score to Firebase
  const submitScore = async (game, score) => {
    try {
      const leaderboardRef = ref(database, 'gameLeaderboard');
      const newScoreRef = push(leaderboardRef);
      
      const scoreData = {
        id: newScoreRef.key,
        username: username,
        game: game,
        score: score,
        timestamp: serverTimestamp()
      };

      await set(newScoreRef, scoreData);
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Error submitting score:', error);
      setError('Failed to save score. Please try again.');
    }
  };

  const games = {
    phishing: {
      title: 'Phishing Detection Quiz',
      description: 'Test your ability to identify phishing attempts in emails and messages.',
      component: <PhishingGame 
        onComplete={(newScore) => {
          console.log('Phishing game completed with score:', newScore);
          submitScore('phishing', newScore);
          setGameState((prev) => ({
            ...prev,
            phishing: { score: newScore, completed: true },
          }));
        }}
      />,
    },
    password: {
      title: 'Password Strength Game',
      description: 'Learn what makes a strong password and test your password creation skills.',
      component: <PasswordGame 
        onComplete={(newScore) => {
          console.log('Password game completed with score:', newScore);
          submitScore('password', newScore);
          setGameState((prev) => ({
            ...prev,
            password: { score: newScore, completed: true },
          }));
        }}
      />,
    },
    puzzle: {
      title: 'Cyber Safety Puzzle',
      description: 'Solve puzzles based on real-world cybersecurity scenarios.',
      component: <PuzzleGame 
        onComplete={(newScore) => {
          console.log('Puzzle game completed with score:', newScore);
          submitScore('puzzle', newScore);
          setGameState((prev) => ({
            ...prev,
            puzzle: { score: newScore, completed: true },
          }));
        }}
      />,
    },
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="games-container">
      <h1>Cybersecurity Games</h1>
      <div className="username-display">
        Your username: <span className="username-highlight">{username}</span>
      </div>

      <div className="game-selector">
        {Object.keys(games).map((game) => (
          <button
            key={game}
            className={`game-button ${activeGame === game ? 'active' : ''}`}
            onClick={() => setActiveGame(game)}
          >
            {games[game].title}
            {gameState[game].completed && (
              <span className="score-badge">Score: {gameState[game].score}</span>
            )}
          </button>
        ))}
      </div>

      <div className="game-content">
        <h2>{games[activeGame].title}</h2>
        <p className="game-description">{games[activeGame].description}</p>
        {games[activeGame].component}
      </div>

      <div className="leaderboard">
        <h2>Leaderboard: {games[activeGame].title}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  Loading leaderboard...
                </td>
              </tr>
            ) : leaderboard.length > 0 ? (
              leaderboard.slice(0, 10).map((entry, index) => (
                <tr key={entry.id} className={entry.username === username ? 'highlight' : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.username}</td>
                  <td>{entry.score}</td>
                  <td>{formatTimestamp(entry.timestamp)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No scores yet. Be the first to play!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Placeholder game components
const PhishingGame = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setIsGameComplete(false);
    setAnsweredQuestions(new Set());
    onComplete(0); // Reset score in parent component
  };

  const questions = [
    {
      question: "Is this email legitimate? 'Dear user, your account will be suspended unless you click here immediately.'",
      options: ["Yes", "No"],
      correct: 1
    },
    {
      question: "A message asks for your password to verify your account. What should you do?",
      options: ["Provide the password", "Ignore and report", "Forward to IT"],
      correct: 1
    }
  ];

  const handleAnswer = (answerIndex) => {
    if (isGameComplete || answeredQuestions.has(currentQuestion)) {
      return;
    }

    setAnsweredQuestions(prev => new Set([...prev, currentQuestion]));

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prevScore => prevScore + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsGameComplete(true);
      onComplete(score + (answerIndex === questions[currentQuestion].correct ? 1 : 0));
    }
  };

  return (
    <div className="game-quiz">
      <h3>Question {currentQuestion + 1} of {questions.length}</h3>
      <p>{questions[currentQuestion].question}</p>
      <div className="options">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${
              answeredQuestions.has(currentQuestion) ? 
                index === questions[currentQuestion].correct ? 'correct' : 'disabled' 
                : ''
            }`}
            onClick={() => handleAnswer(index)}
            disabled={answeredQuestions.has(currentQuestion)}
          >
            {option}
          </button>
        ))}
      </div>
      {isGameComplete && (
        <div className="game-complete">
          <p>Game Complete! Final Score: {score}/{questions.length}</p>
          <button className="retry-button" onClick={resetGame}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

const PasswordGame = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState([]);

  const resetGame = () => {
    setPassword('');
    setStrength(0);
    setIsComplete(false);
    setFeedback([]);
    onComplete(0);
  };

  const checkPasswordRequirements = (pass) => {
    let score = 0;
    const missing = [];
    
    // Check length
    if (pass.length < 8) {
      missing.push("At least 8 characters long");
    } else {
      score++;
    }

    // Check uppercase
    if (!/[A-Z]/.test(pass)) {
      missing.push("At least one uppercase letter");
    } else {
      score++;
    }

    // Check numbers
    if (!/[0-9]/.test(pass)) {
      missing.push("At least one number");
    } else {
      score++;
    }

    // Check special characters
    if (!/[^A-Za-z0-9]/.test(pass)) {
      missing.push("At least one special character");
    } else {
      score++;
    }

    setFeedback(missing);
    return score;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const newStrength = checkPasswordRequirements(newPassword);
    setStrength(newStrength);
  };

  const handleSubmit = () => {
    setIsComplete(true);
    onComplete(strength);
  };

  return (
    <div className="password-game">
      <input
        type="text"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Create a strong password"
        disabled={isComplete}
      />
      <div className="strength-meter">
        <div 
          className="strength-bar"
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <p>Password Strength: {strength}/4</p>
      
      {feedback.length > 0 && !isComplete && (
        <div className="password-feedback">
          <p>Missing requirements:</p>
          <ul>
            {feedback.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {!isComplete ? (
        <button 
          className="submit-button"
          onClick={handleSubmit}
        >
          Submit
        </button>
      ) : (
        <div className="game-complete">
          <p>Final Score: {strength * 25}%</p>
          {strength < 4 && (
            <div className="password-feedback">
              <p>Your password was missing:</p>
              <ul>
                {feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="retry-button" onClick={resetGame}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

const PuzzleGame = ({ onComplete }) => {
  const initialSteps = [
    { id: 1, text: 'Change default router password', order: 1 },
    { id: 2, text: 'Enable WPA2 encryption', order: 2 },
    { id: 3, text: 'Update router firmware', order: 3 },
    { id: 4, text: 'Set up guest network', order: 4 }
  ];

  const [steps, setSteps] = useState(initialSteps);
  const [draggedStep, setDraggedStep] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const resetGame = () => {
    setSteps([...initialSteps]);
    setDraggedStep(null);
    setIsComplete(false);
    setScore(0);
    setAttempts(0);
    onComplete(0); // Reset score in parent component
  };

  const handleDragStart = (e, step) => {
    setDraggedStep(step);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStep) => {
    e.preventDefault();
    if (!draggedStep || draggedStep.id === targetStep.id) return;

    const newSteps = steps.map(step => {
      if (step.id === draggedStep.id) {
        return { ...step, order: targetStep.order };
      }
      if (step.id === targetStep.id) {
        return { ...step, order: draggedStep.order };
      }
      return step;
    });

    setSteps(newSteps.sort((a, b) => a.order - b.order));
    setDraggedStep(null);
  };

  const calculateScore = () => {
    let correctPositions = 0;
    steps.forEach((step) => {
      if (step.id === step.order) {
        correctPositions++;
      }
    });
    return Math.round((correctPositions / steps.length) * 100);
  };

  const checkOrder = () => {
    setAttempts(prev => prev + 1);
    const newScore = calculateScore();
    setScore(newScore);
    
    const isCorrect = steps.every((step, index) => step.id === index + 1);
    if (isCorrect || attempts >= maxAttempts - 1) {
      setIsComplete(true);
      onComplete(newScore);
    }
  };

  return (
    <div className="puzzle-game">
      <h3>Scenario: Secure Your Home Network</h3>
      <p>Drag and drop the steps in the correct order:</p>
      <div className="puzzle-steps">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`puzzle-step ${isComplete ? (step.id === step.order ? 'correct' : 'incorrect') : ''}`}
            draggable={!isComplete}
            onDragStart={(e) => handleDragStart(e, step)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, step)}
          >
            {step.text}
          </div>
        ))}
      </div>
      <div className="puzzle-controls">
        {!isComplete ? (
          <button 
            className="complete-button"
            onClick={checkOrder}
          >
            Check Order ({maxAttempts - attempts} attempts left)
          </button>
        ) : (
          <div className="game-complete">
            <p>Game Over! Final Score: {score}%</p>
            <button className="retry-button" onClick={resetGame}>
              Try Again
            </button>
          </div>
        )}
        {score > 0 && !isComplete && (
          <div className="score-display">
            Current Score: {score}%
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;