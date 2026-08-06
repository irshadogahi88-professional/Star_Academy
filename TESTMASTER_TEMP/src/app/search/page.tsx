"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useSession } from "next-auth/react";

export default function StudentSearchPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 3) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.mcqs);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-extrabold text-xs tracking-widest">RK</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">TestMaster<span className="text-indigo-600">.</span></h1>
              </Link>
              <div className="flex space-x-4">
                {session && <Link href="/student/dashboard" className="text-gray-500 hover:text-gray-900 font-medium px-3 py-2">Dashboard</Link>}
                <Link href="/search" className="text-indigo-600 font-medium px-3 py-2 border-b-2 border-indigo-600">Search MCQs</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-gray-700 font-medium hidden sm:block">{session?.user?.name}</span>
                  <Link href="/api/auth/signout" className="text-gray-500 hover:text-red-600 transition">
                    <LogOut className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">
                  Log In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Study Tool: MCQ Search</h2>
          <p className="text-gray-500 text-lg">Type a keyword to instantly find related questions and review their answers.</p>
        </div>

        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-indigo-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm text-lg"
            placeholder="Search for 'mitochondria', 'algebra', etc..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading && <div className="text-center text-gray-500">Searching...</div>}
          
          {!loading && query.length > 0 && query.length < 3 && (
            <div className="text-center text-gray-500">Type at least 3 characters to search...</div>
          )}

          {!loading && query.length >= 3 && results.length === 0 && (
            <div className="text-center bg-white p-10 rounded-2xl border border-gray-100">
              <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No questions found matching "{query}"</p>
            </div>
          )}

          {!loading && results.map((mcq) => (
            <div key={mcq._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(mcq._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex space-x-2 mb-3">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded">{mcq.subjectId?.name || "General"}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">{mcq.chapterId?.name || "Chapter 1"}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed pr-8">{mcq.question}</h3>
                  </div>
                  <div className="flex-shrink-0 text-gray-400 mt-1">
                    {expandedId === mcq._id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </div>
              </div>

              {expandedId === mcq._id && (
                <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50/50 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pt-4">
                    {mcq.options.map((opt: string, idx: number) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border-2 text-sm flex items-center space-x-3 ${
                          idx === mcq.correctIndex 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          idx === mcq.correctIndex ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  
                  {mcq.explanation && (
                    <div className="p-4 bg-indigo-50 text-indigo-900 text-sm rounded-xl border border-indigo-100 flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 flex-shrink-0 text-indigo-600 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-1">Explanation</span> 
                        {mcq.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
