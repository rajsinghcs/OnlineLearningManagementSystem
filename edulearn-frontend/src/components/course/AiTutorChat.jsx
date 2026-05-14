import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../api/aiApi';
import { SparklesIcon, XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AiTutorChat = ({ lesson, course, resources }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: `Hi! I'm your AI Tutor. Confused about "${lesson?.title}"? Ask me anything!`, isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), text: input, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.askTutor({
        lessonTitle: lesson.title,
        lessonContent: lesson.description || course?.description || "No description",
        contentUrl: lesson.contentUrl || lesson.content_url,
        contentType: lesson.contentType,
        resources: resources?.map(r => ({ fileName: r.fileName, fileUrl: r.fileUrl })),
        studentQuestion: input
      });

      const aiMsg = { id: Date.now() + 1, text: response.data.answer, isAi: true };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Tutor is resting. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-tr from-purple-600 to-blue-600 text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all z-40 group"
      >
        <SparklesIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white/80 backdrop-blur-xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-500 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black italic">AI TUTOR</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Context: {lesson?.title}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.isAi 
                ? 'bg-white border border-gray-100 shadow-sm text-gray-800' 
                : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-100'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-2xl flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-6 border-t bg-gray-50/50">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-4 pr-12 py-4 bg-white border-none rounded-2xl shadow-inner focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-2 p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AiTutorChat;
