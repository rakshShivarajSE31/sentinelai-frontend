import React, { useState } from 'react';
import { MessageSquare, Send, Clock, Database, Sparkles } from 'lucide-react';
import { queryIncidents } from '../../services/api';

const EXAMPLE_QUESTIONS = [
  "How many HIGH severity incidents do we have?",
  "Which user triggered the most anomalies?",
  "What is the average risk score across all incidents?",
  "How many incidents are still unresolved?",
  "Give me a security summary of the current situation",
  "What are the most common anomaly patterns?",
  "Which incidents happened most recently?",
  "How many incidents were resolved today?",
];

interface QueryHistoryItem {
  question: string;
  answer: string;
  dataPoints: number;
  timestamp: Date;
  responseTime: number;
}

const NaturalQuery: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<QueryHistoryItem | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  const handleQuery = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;

    setLoading(true);
    setQuestion(queryText);
    const startTime = Date.now();

    try {
      const result = await queryIncidents(queryText);
      const responseTime = Date.now() - startTime;

      const historyItem: QueryHistoryItem = {
        question: queryText,
        answer: result.answer,
        dataPoints: result.dataPoints,
        timestamp: new Date(),
        responseTime
      };

      setCurrentAnswer(historyItem);
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
      setQuestion('');
    } catch (e) {
      setCurrentAnswer({
        question: queryText,
        answer: 'Failed to get answer. Please check that the backend is running.',
        dataPoints: 0,
        timestamp: new Date(),
        responseTime: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>AI Query</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Ask Claude anything about your incident data in plain English
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>

        {/* Left — Query Input + Answer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Input */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="var(--accent-blue)" />
              Ask a Question
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. How many HIGH severity incidents do we have today?"
                rows={3}
                style={{
                  width: '100%', padding: '14px 50px 14px 14px',
                  backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text-primary)', fontSize: '14px',
                  outline: 'none', resize: 'none', lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => handleQuery()}
                disabled={loading || !question.trim()}
                style={{
                  position: 'absolute', right: '12px', bottom: '12px',
                  width: '36px', height: '36px', borderRadius: '8px',
                  backgroundColor: loading || !question.trim() ? 'var(--border)' : 'var(--accent-blue)',
                  border: 'none', cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Send size={14} />
              </button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Press Enter to send · Shift+Enter for new line
            </div>
          </div>

          {/* Answer */}
          {loading && (
            <div style={{
              backgroundColor: 'var(--bg-card)', borderRadius: '12px',
              padding: '24px', border: '1px solid var(--border)', textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: '2px solid var(--accent-blue)', borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Claude is analyzing your data...</span>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {currentAnswer && !loading && (
            <div className="fade-in" style={{
              backgroundColor: 'var(--bg-card)', borderRadius: '12px',
              border: '1px solid var(--accent-blue)40', overflow: 'hidden'
            }}>
              {/* Answer Header */}
              <div style={{
                padding: '14px 20px', borderBottom: '1px solid var(--border)',
                backgroundColor: 'rgba(59,130,246,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="var(--accent-blue)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                    Claude's Answer
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Database size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {currentAnswer.dataPoints} data points
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} color="var(--text-muted)" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {currentAnswer.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>YOUR QUESTION</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{currentAnswer.question}"
                </div>
              </div>

              {/* Answer Content */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.8,
                  whiteSpace: 'pre-wrap'
                }}>
                  {currentAnswer.answer}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!currentAnswer && !loading && (
            <div style={{
              backgroundColor: 'var(--bg-card)', borderRadius: '12px',
              padding: '48px', border: '1px solid var(--border)',
              textAlign: 'center', color: 'var(--text-muted)'
            }}>
              <Sparkles size={40} strokeWidth={1} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', marginBottom: '8px' }}>Ask anything about your incidents</p>
              <p style={{ fontSize: '13px' }}>Claude reads real data from PostgreSQL and answers accurately</p>
            </div>
          )}
        </div>

        {/* Right — Examples + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Example Questions */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              💡 Example Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuery(q)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px', borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '12px', textAlign: 'left', lineHeight: 1.4,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (!loading) (e.target as HTMLElement).style.borderColor = 'var(--accent-blue)';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = 'var(--border)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Query History */}
          {history.length > 0 && (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                📜 Recent Queries
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentAnswer(item)}
                    style={{
                      padding: '8px 10px', borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                    <div style={{
                      fontSize: '12px', color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {item.question}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NaturalQuery;
