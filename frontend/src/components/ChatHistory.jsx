import React, { useState, useEffect } from 'react';
import './ChatHistory.css';
import HistoryViewer from './HistoryViewer';

const API = window.location.hostname === 'localhost' ? 'http://localhost:8001' : window.location.origin

const todayIso = () => new Date().toISOString().slice(0, 10)
const daysAgoIso = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }
const fmt = (s) => {
  if (!s) return ''
  const d = new Date(s.includes('Z') || s.includes('T') ? s : s.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? s : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ChatHistory = ({ teacherId, isOpen, onClose, onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sessionId, setSessionId] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API}/api/chat-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId }),
      })
      if (res.ok) { const d = await res.json(); setSessions(d.sessions || []) }
    } catch (_) {}
  };

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/api/chat-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: teacherId,
          date_from: dateFrom || null,
          date_to: dateTo || null,
          session_id: sessionId || null,
          limit: 100,
        })
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

  useEffect(() => { if (isOpen) { fetchSessions(); fetchChatHistory() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teacherId]);
  useEffect(() => { if (isOpen) fetchChatHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, sessionId]);

  const setPreset = (p) => {
    const t = todayIso()
    if (p === 'today')      { setDateFrom(t);             setDateTo(t) }
    else if (p === 'week')  { setDateFrom(daysAgoIso(7)); setDateTo(t) }
    else if (p === 'month') { setDateFrom(daysAgoIso(30));setDateTo(t) }
    else                    { setDateFrom('');            setDateTo('') }
  };

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

        {/* Filter bar */}
        <div style={{ padding: '10px 12px', borderBottom: '1.5px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setPreset('today')} style={presetBtn}>Today</button>
            <button onClick={() => setPreset('week')}  style={presetBtn}>7d</button>
            <button onClick={() => setPreset('month')} style={presetBtn}>30d</button>
            <button onClick={() => setPreset('all')}   style={presetBtn}>All</button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={dateInput} title="From" />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>→</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={dateInput} title="To" />
          </div>
          <select value={sessionId} onChange={e => setSessionId(e.target.value)} style={{ ...dateInput, width: '100%' }}>
            <option value="">All sessions</option>
            {sessions.map((s, i) => (
              <option key={s.session_id || i} value={s.session_id}>
                {fmt(s.first_at)} · {s.count} item{s.count === 1 ? '' : 's'}
              </option>
            ))}
          </select>
          {(dateFrom || dateTo || sessionId) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setSessionId('') }}
              style={{ ...presetBtn, color: '#ef4444', borderColor: '#fecaca', alignSelf: 'flex-start' }}>
              Clear filters
            </button>
          )}
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

const presetBtn = {
  padding: '4px 10px', fontSize: 11, fontWeight: 700,
  background: 'var(--bg)', color: 'var(--text-1)',
  border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer',
}
const dateInput = {
  padding: '4px 8px', fontSize: 11,
  background: 'var(--bg)', color: 'var(--text-1)',
  border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit',
}

export default ChatHistory;
