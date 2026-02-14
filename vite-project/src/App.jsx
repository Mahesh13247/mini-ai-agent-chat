import { useState, useRef, useEffect } from 'react';
import { mockAgentResponse } from './mockBackend';
import './App.css';

function App() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: "👋 Hi! I'm your AI assistant. I can help you with math calculations and remember things for you. Try asking me something!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ========================================
  // AUTO-SCROLL TO BOTTOM
  // ========================================
  // ========================================
  // AUTO-SCROLL TO BOTTOM
  // ========================================
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // ========================================
  // MESSAGE HANDLING
  // ========================================
  const handleSendMessage = async () => {
    // Validate input
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now() + Math.random(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get agent response
      const response = await mockAgentResponse(userMessage.text);

      // Add agent response
      const agentMessage = {
        id: Date.now() + Math.random(),
        sender: 'agent',
        text: response.message,
        timestamp: new Date(),
        data: response
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = {
        id: Date.now() + Math.random(),
        sender: 'agent',
        text: '❌ Oops! Something went wrong. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ========================================
  // SELF-DIAGNOSTIC TEST
  // ========================================
  const runSelfTest = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const testSteps = [
      { text: "Starting Self-Diagnostic Test...", type: 'system' },
      { text: "What is 10 plus 20?", type: 'user' },
      { text: "Remember my status is testing", type: 'user' },
      { text: "What is my status?", type: 'user' },
      { text: "System Test Complete ✅", type: 'system' }
    ];

    try {
      for (const step of testSteps) {
        if (step.type === 'system') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'system',
            text: step.text,
            timestamp: new Date()
          }]);
          await new Promise(resolve => setTimeout(resolve, 800)); // Short delay for readability
        } else {
          // Simulate user message
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'user',
            text: step.text,
            timestamp: new Date()
          }]);

          await new Promise(resolve => setTimeout(resolve, 500)); // Natural typing delay

          // Get and display agent response
          const response = await mockAgentResponse(step.text);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'agent',
            text: response.message,
            timestamp: new Date(),
            data: response
          }]);

          await new Promise(resolve => setTimeout(resolve, 1000)); // Reading delay
        }
      }
    } catch (error) {
      console.error("Test failed:", error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'system',
        text: '❌ Self-Test Failed due to an error.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // ========================================
  // SUGGESTED PROMPTS
  // ========================================
  const suggestedPrompts = [
    { id: 1, label: "Calculate 10 + 15", text: "What is 10 plus 15?" },
    { id: 2, label: "Save Info", text: "Remember my name is Alex" },
    { id: 3, label: "Recall Info", text: "What is my name?" },
    { id: 4, label: "Help", text: "What can you do?" },
  ];

  const handleSuggestedClick = (text) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  // ========================================
  // CLEAR CHAT
  // ========================================
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([
        {
          id: 1,
          sender: 'agent',
          text: "👋 Chat cleared! How can I help you now?",
          timestamp: new Date()
        }
      ]);
      setInputValue('');
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="app-container">
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <div className="header-icon">🤖</div>
          <div>
            <h1 className="header-title">AI Agent Chat</h1>
            <p className="header-subtitle">Your intelligent assistant</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={handleClearChat}
            className="icon-button clear-button"
            title="Clear Chat"
          >
            🗑️
          </button>
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </header>

      {/* Chat Window */}
      <main className="chat-window">
        {/* ... existing messages ... */}
        <div className="messages-container" role="log" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="message-wrapper agent-message">
              <div className="message-bubble agent-bubble loading-bubble">
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
                <span className="typing-text">Agent is typing...</span>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Suggested Prompts */}
      <div className="suggestions-container">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handleSuggestedClick(prompt.text)}
            className="suggestion-chip"
            disabled={isLoading}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <footer className="input-bar">
        <div className="input-container">
          <button
            onClick={runSelfTest}
            disabled={isLoading}
            className="test-button"
            title="Run Self-Diagnostic Test"
          >
            🧪
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="send-icon"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <span className='devlopname'>
          <h4>Developed By Mahesh (Made With ❤️)</h4>
        </span>
      </footer>
    </div>
  );
}

// ========================================
// MESSAGE BUBBLE COMPONENT
// ========================================
function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const isError = message.isError;
  const isSystem = message.sender === 'system';

  return (
    <div className={`message-wrapper ${isUser ? 'user-message' : isSystem ? 'system-message' : 'agent-message'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : isSystem ? 'system-bubble' : 'agent-bubble'} ${isError ? 'error-bubble' : ''}`}>
        <p className="message-text">{message.text}</p>
        <span className="message-time">
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
}

export default App;
