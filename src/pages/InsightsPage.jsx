import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const HeartbeatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[22px] h-[22px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.5h-3.5a1 1 0 0 0-.96.72l-1.28 4.3a.5.5 0 0 1-.96 0l-3.32-9.61a1 1 0 0 0-1.9 0L7.64 12.22a1 1 0 0 1-.96.78H2" />
  </svg>
);

export default function InsightsPage() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('medintel_chatbot_messages');
      if(saved) return JSON.parse(saved);
    } catch(e) {}
    return [{ role: 'ai', content: "Hello! I am MedIntel Clinical AI. I have encrypted access to your Medical History and Profile Vitals. How can I help you understand your health today?" }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [vitals, setVitals] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    sessionStorage.setItem('medintel_chatbot_messages', JSON.stringify(messages));
  }, [messages, isTyping]);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
    setVitals({
       bp: profile.bloodPressure || 'Unknown',
       age: profile.age || 'Unknown',
       height: profile.height || 'Unknown',
       weight: profile.weight || 'Unknown'
    });

    if (profile.token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/reports`, {
        headers: { Authorization: `Bearer ${profile.token}` }
      })
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(console.error);
    }
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const profile = JSON.parse(localStorage.getItem('medintel_user_profile') || "{}");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${profile.token}` },
        body: JSON.stringify({ message: userMsg, vitals, history })
      });
      const data = await res.json();
      
      if (data.success && data.response) {
         setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      } else {
         throw new Error(data.message || "Failed to parse Response");
      }
    } catch(err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to Clinical AI Cluster: " + err.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout headerTitle="Clinical AI" headerSubtitle="RAG Chatbot Assistant">
      <div className="flex flex-col h-[76vh] border border-gray-100 rounded-[32px] bg-white shadow-xl shadow-teal-900/5 overflow-hidden -mt-4 relative">
        
        {/* CHAT HEADER */}
        <div className="bg-[#0a192f] p-5 flex items-center gap-4 shrink-0 px-8 relative overflow-hidden">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-teal-400 overflow-hidden shrink-0">
               <img src="https://api.dicebear.com/9.x/micah/svg?seed=Doctor&backgroundColor=ffffff" alt="Animated Doctor" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <h2 className="text-white font-extrabold tracking-tight text-[18px]">Med-Intel-AI</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                 <p className="text-teal-200 text-[11px] font-bold uppercase tracking-[0.05em]">Online</p>
              </div>
            </div>
        </div>

        {/* CHAT MESSAGE BLOCK BACKGROUND */}
        <div 
          className="flex-1 overflow-y-auto p-8 space-y-7 stylish-scroll relative"
          style={{
             backgroundColor: '#f8fafc',
             backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
             backgroundSize: '24px 24px'
          }}
        >

           {messages.map((m, i) => (
             <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="flex flex-col items-start max-w-[75%] gap-1.5">
                     <div className="flex items-center gap-2 ml-1">
                        <img src="https://api.dicebear.com/9.x/micah/svg?seed=Doctor&backgroundColor=ffffff" alt="Doctor avatar" className="w-7 h-7 rounded-full bg-white shadow-sm border border-gray-200 object-cover" />
                        <span className="text-[13px] font-bold text-slate-800">Med-Intel-AI</span>
                     </div>
                     <div className="bg-white border border-gray-200 text-slate-700 rounded-[28px] rounded-tl-sm shadow-[0_4px_16px_rgba(0,0,0,0.03)] font-medium px-6 py-4.5 text-[14px] leading-relaxed block whitespace-pre-wrap">
                        {m.content}
                     </div>
                  </div>
                )}
                
                {m.role === 'user' && (
                  <div className="max-w-[75%] bg-linear-to-br from-[#0a192f] to-teal-800 text-white rounded-[24px] rounded-br-sm shadow-xl shadow-[#0a192f]/20 font-medium px-6 py-4.5 text-[14px] leading-relaxed block whitespace-pre-wrap">
                     {m.content}
                  </div>
                )}
             </div>
           ))}
           
           {isTyping && (
             <div className="flex justify-start">
               <div className="flex flex-col items-start gap-1.5">
                  <div className="flex items-center gap-2 ml-1">
                     <img src="https://api.dicebear.com/9.x/micah/svg?seed=Doctor&backgroundColor=ffffff" alt="Doctor avatar" className="w-7 h-7 rounded-full bg-white shadow-sm border border-gray-200 object-cover" />
                     <span className="text-[13px] font-bold text-slate-800">Med-Intel-AI</span>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-[24px] rounded-tl-sm flex gap-2 w-max shadow-sm items-center h-[56px]">
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                  </div>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* INPUT BAR CONTROLLER */}
        <div className="p-6 bg-white/60 backdrop-blur-xl border-t border-gray-100 shrink-0 z-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex flex-row items-center gap-3 relative">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Example: How does my recent MRI correlate with my high blood pressure?"
               className="flex-1 bg-white border-2 border-gray-100 rounded-3xl pl-8 pr-16 py-4.5 text-[14px] font-bold outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[#0a192f] placeholder-gray-400 shadow-sm"
             />
             <button disabled={isTyping || !input.trim()} type="submit" className="bg-linear-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 disabled:from-gray-300 disabled:to-gray-400 transition-all w-[52px] h-[52px] rounded-2xl text-white flex items-center justify-center shadow-lg shadow-teal-500/30 absolute right-1.5 top-[4px]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[20px] h-[20px] ml-1"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
             </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2">
             <p className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold text-center">
               <span className="text-teal-600 mr-2">✦</span>
               All clinical notes and responses generated should be verified by a certified healthcare professional.
             </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
