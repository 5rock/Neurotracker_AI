import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Send, Brain, Trash2, Sparkles, User } from 'lucide-react';
import { aiAPI } from '../services/api';

const MarkdownRenderer = lazy(() => import('../components/chat/MarkdownRenderer'));

const WELCOME_CONTENT = "Hi! I'm **NeuroTrack AI**, your personal learning mentor. 🧠\n\nI can help you with:\n- **Study planning** and revision schedules\n- **Career guidance** and skill gap analysis\n- **Explaining concepts** you're struggling with\n- **Motivating** you on your learning journey\n\nWhat would you like to talk about today?";

const createWelcomeMessage = () => ({
  role: 'assistant',
  content: WELCOME_CONTENT,
  timestamp: Date.now(),
});

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const SUGGESTED_QUESTIONS = [
  "What should I revise today?",
  "Am I job ready for a Full Stack Developer role?",
  "What skills should I learn next?",
  "Why am I weak in Dynamic Programming?",
  "Create a 30-day study plan for DSA",
  "What are the top skills for AI/ML in 2024?",
];

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Brain size={16} color="white" />
    </div>
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 12 }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        padding: '4px 16px',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? <User size={15} color="#818cf8" /> : <Brain size={15} color="white" />}
      </div>
      <div style={{
        maxWidth: '75%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        background: isUser ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
        border: `1px solid ${isUser ? 'rgba(99,102,241,0.2)' : 'var(--border-color)'}`,
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
      }}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <Suspense fallback={<p style={{ fontSize: 14 }}>{message.content.slice(0, 120)}…</p>}>
            <MarkdownRenderer content={message.content} />
          </Suspense>
        )}
        {message.timestamp ? (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
            {formatMessageTime(message.timestamp)}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AIMentor = () => {
  const [messages, setMessages] = useState(() => [createWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
    setLoading(true);

    try {
      const res = await aiAPI.chat(userMessage, sessionId);
      setSessionId(res.data.sessionId);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: res.data.response,
        timestamp: Date.now(),
      }]);
    } catch (err) {
      const errMsg = err.response?.status === 503
        ? "⚠️ AI service is currently unavailable. Please add your OpenAI API key in the backend `.env` file to enable AI features."
        : "Sorry, I encountered an error. Please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared! How can I help you today? 🧠',
      timestamp: Date.now(),
    }]);
    setSessionId(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', height: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 16px 0',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              AI Mentor
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(16,185,129,0.15)', color: '#34d399',
                border: '1px solid rgba(16,185,129,0.2)', letterSpacing: '0.5px',
              }}>LIVE</span>
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by GPT-4 · Your personal learning coach</p>
          </div>
        </div>
        <button type="button" onClick={clearChat} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
          <Trash2 size={13} /> Clear
        </button>
      </header>

      {messages.length <= 1 && (
        <div style={{ padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="btn-ghost"
              style={{ padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500 }}
            >
              <Sparkles size={11} style={{ display: 'inline', marginRight: 5 }} />
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: 12,
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {messages.map((msg, i) => <ChatMessage key={`${msg.timestamp}-${i}`} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: 16,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="input-field"
          style={{ flex: 1, resize: 'none', maxHeight: 120, fontFamily: 'inherit' }}
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '12px 20px', opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIMentor;
