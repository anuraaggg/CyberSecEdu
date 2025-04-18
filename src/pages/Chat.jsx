import { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, set, serverTimestamp, get } from 'firebase/database';
import { database } from '../config/firebase';
import '../styles/chat.css';

const generateRandomUsername = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Wise', 'Swift', 'Gentle', 'Bright', 'Calm', 'Cool', 'Wild'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Lion', 'Wolf', 'Fox', 'Bear', 'Hawk', 'Owl'];
  const randomNumber = Math.floor(Math.random() * 1000);
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}${randomNumber}`;
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username] = useState(generateRandomUsername()); // Username is now fixed for the session
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const initializeFirebase = async () => {
    try {
      console.log('Initializing Firebase connection...');
      setIsLoading(true);
      setError(null);

      const messagesRef = ref(database, 'messages');
      
      // First check if messages node exists
      try {
        const snapshot = await get(messagesRef);
        if (!snapshot.exists()) {
          await set(messagesRef, {});
        }
      } catch (error) {
        console.error('Error checking messages node:', error);
      }

      // Set up real-time listener
      const unsub = onValue(messagesRef, (snapshot) => {
        console.log('Received new messages');
        setIsLoading(false);
        setIsConnected(true);
        setError(null);

        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data)
            .map(([key, value]) => ({
              ...value,
              id: key
            }))
            .sort((a, b) => {
              const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return timeA - timeB;
            });
          
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      }, (error) => {
        console.error('Database error:', error);
        setError('Connection lost. Attempting to reconnect...');
        setIsConnected(false);
        scheduleReconnect();
      });

      // Store the unsubscribe function
      unsubscribeRef.current = unsub;
    } catch (error) {
      console.error('Setup error:', error);
      setError('Failed to connect. Attempting to reconnect...');
      setIsConnected(false);
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      initializeFirebase();
    }, 5000);
  };

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected) return;

    try {
      const messagesRef = ref(database, 'messages');
      const newMessageRef = push(messagesRef);
      
      const messageData = {
        id: newMessageRef.key,
        user: username,
        message: inputMessage.trim(),
        timestamp: serverTimestamp()
      };

      await set(newMessageRef, messageData);
      setInputMessage('');
      setError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-container">
      <h1>Global Security Chat</h1>
      <div className="username-display">
        Your username: <span className="username-highlight">{username}</span>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-window">
        <div className="messages">
          {isLoading ? (
            <div className="loading-message">Connecting to chat...</div>
          ) : messages.length === 0 ? (
            <div className="empty-message">No messages yet. Be the first to say hello!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.user === username ? 'user-message' : ''}`}>
                <div className="message-header">
                  <span className="username">{msg.user}</span>
                  <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <div className="message-content">{msg.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="message-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            required
            disabled={!isConnected}
          />
          <button type="submit" disabled={!isConnected || isLoading}>
            {isConnected ? "Send" : "Connecting..."}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 