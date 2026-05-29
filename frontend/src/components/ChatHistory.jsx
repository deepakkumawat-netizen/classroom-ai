import React, { useState, useEffect } from 'react';
import './ChatHistory.css';
import HistoryViewer from './HistoryViewer';

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin

const ChatHistory = ({ teacherId, isOpen, onClose, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId })
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchChatHistory();
  }, [isOpen, teacherId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getToolIcon = (toolName) => {
    const icons = {
      worksheet: '📝',
      lesson_plan: '📚',
      'lesson-plan': '📚',
      assessment: '✅',
      'mc-assessment': '✅',
      auto_generate: '⚡',
      'auto-generate': '⚡',
      quiz: '🎯',
    };
    return icons[toolName] || '💬';
  };

  // Quick PDF download directly from the list (no need to open the viewer)
  const downloadPdf = (chat, e) => {
    e.stopPropagation()
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => {
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const margin = 15
      const maxW = pageW - margin * 2
      let y = margin
      const text = chat.content || chat.preview || ''
      text.split('\n').forEach(line => {
        if (y > pageH - margin) { doc.addPage(); y = margin }
        const t = line.trim()
        if (!t) { y += 4; return }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(11, 27, 45)
        const wrapped = doc.splitTextToSize(t, maxW)
        if (y + wrapped.length * 5.5 > pageH - margin) { doc.addPage(); y = margin }
        doc.text(wrapped, margin, y)
        y += wrapped.length * 5.5 + 2
      })
      doc.save(`${(chat.topic || chat.tool_name || 'history').replace(/\s+/g, '-')}.pdf`)
    }
    document.head.appendChild(script)
  }

  // Persist edits back to SQLite
  const saveEdits = async (chat, newContent) => {
    try {
      const res = await fetch(`${API}/api/update-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.id, content: newContent }),
      })
      if (!res.ok) throw new Error('save failed')
      // refresh the in-memory list so the preview reflects the edit
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, content: newContent, preview: newContent.slice(0, 200) } : c))
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return (
    <>
      <div className={`chat-history-panel ${isOpen ? 'open' : 'closed'}`}>
        <div className="chat-history-header">
          <h3>📋 Recent Chats</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="chat-history-content">
          {loading ? (
            <div className="loading">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <p>No recent chats yet.</p>
              <p className="hint">Start creating and your chats will appear here!</p>
            </div>
          ) : (
            <div className="chats-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="chat-item"
                  onClick={() => setActiveChat(chat)}
                  title="Open in editor"
                >
                  <div className="chat-icon">{getToolIcon(chat.tool_name)}</div>
                  <div className="chat-details">
                    <div className="chat-title">{chat.topic}</div>
                    <div className="chat-info">
                      {chat.grade_level} • {chat.subject}
                    </div>
                    <div className="chat-time">{formatDate(chat.created_at)}</div>
                  </div>
                  <button
                    onClick={(e) => downloadPdf(chat, e)}
                    title="Download as PDF"
                    style={{
                      alignSelf: 'center', background: '#fef2f2', color: '#dc2626',
                      border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px',
                      fontWeight: 700, fontSize: 11, cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    ⬇ PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeChat && (
        <HistoryViewer
          chat={activeChat}
          onClose={() => setActiveChat(null)}
          onSave={saveEdits}
        />
      )}
    </>
  );
};

export default ChatHistory;
