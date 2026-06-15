import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../components/Layout";

export default function Assistant() {
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
    { role: 'bot', text: 'Hello! I am Sanjeevani AI. I can help search for patients, check doctor availability, and answer questions about hospital policies using our knowledge base. How can I assist you today?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { message: userMessage });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Error connecting to the AI assistant. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 text-primary-700 rounded-lg mr-4 shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">AI Assistant & Search</h2>
            <p className="text-xs text-gray-500 font-medium">Powered by Gemini AI & RAG Knowledge Base</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn("flex max-w-[90%] sm:max-w-[80%]", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mx-3 shadow-sm",
                msg.role === 'user' ? "bg-white border border-gray-200 text-gray-600" : "bg-primary-600 text-white"
              )}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={cn(
                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary-600 text-white rounded-tr-sm" 
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm prose prose-sm prose-primary max-w-none"
              )}>
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-primary-600 underline" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex flex-row max-w-[85%]">
               <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mx-3 bg-primary-600 text-white shadow-sm">
                  <Bot className="h-5 w-5" />
               </div>
               <div className="px-5 py-3.5 rounded-2xl bg-white border border-gray-200 rounded-tl-sm flex items-center space-x-3 shadow-sm">
                 <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                 <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Searching knowledge base...</span>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about policies, search doctors, or query patient IDs..."
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block pl-5 pr-14 py-4 shadow-inner transition-shadow"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
          Assistant may produce inaccurate information. Always verify critical medical data in appropriate modules.
        </p>
      </div>
    </div>
  );
}
