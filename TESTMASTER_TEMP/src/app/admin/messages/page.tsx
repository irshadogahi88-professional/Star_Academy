"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Mail, Calendar, Trash2 } from "lucide-react";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter(m => m._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Inbox</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage messages and requests sent from the landing page.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold">
          <MessageSquare className="w-5 h-5" />
          <span>{messages.length} Messages</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-20 flex flex-col items-center justify-center text-center shadow-sm transition-colors">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inbox is empty</h2>
          <p className="text-gray-500 dark:text-gray-400">You don't have any messages yet. They will appear here when users submit the contact form.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              
              <div className="flex justify-between items-start mb-4 pl-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{msg.title}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{msg.name}</span>
                    <span>•</span>
                    <a href={`mailto:${msg.emailOrNumber}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{msg.emailOrNumber}</a>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteMessage(msg._id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="pl-4 mt-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">{msg.details}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
