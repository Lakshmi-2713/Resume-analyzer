import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { Send, Sparkles, User, MessageSquareCode, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResumeChat({ resumeId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeCitationIdx, setActiveCitationIdx] = useState(null);
  
  const chatEndRef = useRef(null);

  // Quick Starter Prompts
  const starterPrompts = [
    'How suitable is this candidate for standard Fullstack roles?',
    'What are the most notable skill gaps on this resume?',
    'Rewrite the work experience bullets using the X-Y-Z formula.',
    'Summarize the education and academic background.'
  ];

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim() || isSending) return;

    setInputMessage('');
    setIsSending(true);

    const userMessage = {
      role: 'user',
      content: msgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Gather chat history formatted for Gemini
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content
      }));

      const response = await API.post('/chat', {
        resumeId,
        message: msgText,
        chatHistory
      });

      if (response.data.success) {
        const botMessage = {
          role: 'assistant',
          content: response.data.answer,
          citations: response.data.citations || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered a server communication issue. Please verify your MongoDB connection and Gemini API configs.',
        citations: [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const toggleCitation = (index) => {
    setActiveCitationIdx(activeCitationIdx === index ? null : index);
  };

  return (
    <div className="flex flex-col h-[520px] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-850 px-6 py-4 flex items-center gap-3">
        <div className="p-2.5 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-500">
          <MessageSquareCode className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Contextual RAG Chat</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Vector chunks matching query embeddings are retrieved dynamically.</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-4">
            <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-full text-primary-400 animate-bounce-slow">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start asking questions!</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 max-w-[280px] mt-1.5">
                The chatbot leverages vector search to extract relevant contexts from the resume text.
              </p>
            </div>
            
            {/* Starter Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 text-left bg-slate-50/40 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-850 hover:border-primary-500/40 dark:hover:border-primary-500/30 hover:bg-primary-500/[0.01] rounded-2xl text-xs text-slate-600 dark:text-slate-400 transition-all font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                } animate-fade-in`}
              >
                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold border text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-400'
                    : 'bg-primary-500/10 border-primary-500/20 text-primary-500'
                }`}>
                  {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble Container */}
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-500/10'
                      : 'bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-350 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Render citations drawer if available on bot replies */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="border border-slate-150 dark:border-slate-850/80 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/10">
                      <button
                        onClick={() => toggleCitation(idx)}
                        className="w-full px-3.5 py-2 flex items-center justify-between text-[10px] font-bold text-slate-500 hover:text-slate-400 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-primary-400" />
                          <span>Source Citations ({msg.citations.length} chunks)</span>
                        </span>
                        {activeCitationIdx === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {activeCitationIdx === idx && (
                        <div className="p-3.5 border-t border-slate-150 dark:border-slate-850/80 space-y-2.5 divide-y divide-slate-150 dark:divide-slate-850/40">
                          {msg.citations.map((cite, cIdx) => (
                            <div key={cIdx} className={`${cIdx > 0 ? 'pt-2.5' : ''} text-[9.5px]`}>
                              <div className="flex justify-between font-extrabold text-primary-600 dark:text-primary-400 mb-1">
                                <span>Chunk #{cite.chunkIndex}</span>
                                <span className="bg-primary-500/10 dark:bg-primary-500/5 px-2 py-0.5 rounded-md font-black">
                                  {Math.round(cite.score * 100)}% match
                                </span>
                              </div>
                              <p className="text-slate-500 leading-relaxed italic">
                                "{cite.text.substring(0, 160)}..."
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-4 max-w-[85%] animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5 animate-spin-slow" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Form Footer */}
      <form 
        onSubmit={handleFormSubmit}
        className="bg-slate-50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-850 p-4 flex gap-3"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about this resume (e.g. key qualifications)..."
          disabled={isSending}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-primary-500/80 rounded-2xl outline-none text-xs transition-all duration-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500/10 text-slate-700 dark:text-slate-300"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="p-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-2xl shadow-md shadow-primary-500/15 active:scale-98 transition-all disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
