import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SharedChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { text: message, isUser: true }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "I'm a demo chatbot. I can't answer real questions yet, but I'm here to help!", isUser: false }]);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-army-gold text-army-black rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col h-[500px]"
          >
            <div className="bg-zinc-800 p-4 flex items-center justify-between border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-army-gold" />
                <h3 className="font-black uppercase tracking-wider text-sm">AI Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.isUser ? 'bg-army-gold text-army-black rounded-br-none' : 'bg-zinc-800 text-zinc-300 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-zinc-800 border-t border-zinc-700 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-army-gold"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 bg-army-gold text-army-black rounded disabled:opacity-50 hover:bg-yellow-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
