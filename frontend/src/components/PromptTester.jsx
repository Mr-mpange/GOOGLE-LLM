import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function PromptTester({ onMetricsUpdate }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    const userMessage = {
      type: 'user',
      text: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt(''); // Clear input immediately
    setLoading(true);

    try {
      const result = await axios.post(`${API_URL}/api/prompt`, {
        prompt: currentPrompt,
        userId: 'demo-user',
        sessionId: sessionStorage.getItem('sessionId') || generateSessionId()
      });

      const assistantMessage = {
        type: 'assistant',
        data: result.data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Fetch updated metrics
      const metricsResult = await axios.get(`${API_URL}/api/metrics`);
      onMetricsUpdate(metricsResult.data);
      
    } catch (err) {
      const errorMessage = {
        type: 'error',
        text: err.response?.data?.error || 'Failed to process prompt',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSessionId = () => {
    const id = 'session-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', id);
    return id;
  };

  return (
    <div className="card flex flex-col h-[600px]">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Test LLM Prompt
      </h2>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-sm">Start a conversation with the LLM</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index}>
            {message.type === 'user' && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 bg-blue-500 text-white rounded-lg">
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            )}
            
            {message.type === 'assistant' && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-xs font-medium text-green-800 dark:text-green-200">
                        Response
                      </p>
                    </div>
                    <div 
                      className="formatted-response text-sm text-gray-700 dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: message.data.formatted?.html || message.data.text }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {message.type === 'error' && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{message.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Thinking...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="flex-1 input-field resize-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
