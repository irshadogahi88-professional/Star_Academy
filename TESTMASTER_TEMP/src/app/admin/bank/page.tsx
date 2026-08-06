"use client";

import { useState, useEffect } from "react";
import { Database, Search, Filter, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

export default function MCQBankPage() {
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchMcqs();
  }, [selectedSubject, page]);

  const fetchSubjects = async () => {
    const res = await fetch("/api/admin/subjects");
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.subjects);
    }
  };

  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubject(subjectId === selectedSubject ? "" : subjectId);
    setSelectedChapter(""); // Reset chapter when subject changes
    setPage(1); 
    setChapters([]);
    if (subjectId) {
      const res = await fetch(`/api/admin/chapters?subjectId=${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data.chapters);
      }
    }
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId === selectedChapter ? "" : chapterId);
    setPage(1);
  };

  const fetchMcqs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/mcqs?page=${page}&limit=50`;
      if (selectedSubject) url += `&subjectId=${selectedSubject}`;
      if (selectedChapter) url += `&chapterId=${selectedChapter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMcqs(data.mcqs);
        setTotalPages(data.totalPages || 1);
        setTotalQuestions(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this MCQ?")) return;
    try {
      const res = await fetch(`/api/admin/mcqs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMcqs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDeleteChapter = async () => {
    if (!selectedChapter) return;
    if (!confirm("Are you sure you want to delete ALL MCQs in this chapter? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/mcqs/bulk?chapterId=${selectedChapter}`, { method: "DELETE" });
      if (res.ok) {
        fetchMcqs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [editingMcq, setEditingMcq] = useState<any | null>(null);

  const startEditing = (mcq: any) => {
    setEditingMcq({ ...mcq });
  };

  const handleSaveEdit = async () => {
    if (!editingMcq) return;
    try {
      const res = await fetch(`/api/admin/mcqs/${editingMcq._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editingMcq.question,
          options: editingMcq.options,
          correctIndex: editingMcq.correctIndex,
          explanation: editingMcq.explanation
        })
      });
      if (res.ok) {
        setEditingMcq(null);
        fetchMcqs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMcqs = mcqs.filter(m => 
    m.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MCQ Bank</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage and filter all extracted questions.</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold">
          <Database className="w-5 h-5" />
          <span>{totalQuestions} Total Questions</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8 transition-colors">
        
        {/* Subject Filter Pills */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filter by Subject</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSubjectChange("")}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                selectedSubject === "" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Subjects
            </button>
            {subjects.map(subj => (
              <button
                key={subj._id}
                onClick={() => handleSubjectChange(subj._id)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedSubject === subj._id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {subj.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter Filter Pills (Only visible if Subject is selected) */}
        {selectedSubject && chapters.length > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filter by Chapter / Document</h3>
              {selectedChapter && (
                <button onClick={handleBulkDeleteChapter} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entire Chapter</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChapterChange("")}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedChapter === "" 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                All Chapters
              </button>
              {chapters.map(chap => (
                <button
                  key={chap._id}
                  onClick={() => handleChapterChange(chap._id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                    selectedChapter === chap._id 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {chap.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search in current view..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Loading question bank...</div>
        ) : filteredMcqs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="font-medium text-lg">No questions found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredMcqs.map((mcq, index) => (
              <div key={mcq._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {mcq.subjectId?.name || "General"}
                      </span>
                      {mcq.chapterId?.name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          • {mcq.chapterId.name}
                        </span>
                      )}
                    </div>

                    {editingMcq?._id === mcq._id ? (
                      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Question</label>
                          <textarea 
                            value={editingMcq.question} 
                            onChange={e => setEditingMcq({...editingMcq, question: e.target.value})} 
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {editingMcq.options.map((opt: string, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                name={`correct-${mcq._id}`} 
                                checked={editingMcq.correctIndex === i} 
                                onChange={() => setEditingMcq({...editingMcq, correctIndex: i})}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <input 
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newOptions = [...editingMcq.options];
                                  newOptions[i] = e.target.value;
                                  setEditingMcq({...editingMcq, options: newOptions});
                                }}
                                className={`flex-1 border ${editingMcq.correctIndex === i ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'} text-gray-900 dark:text-white rounded p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500`}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Explanation (Optional)</label>
                          <textarea 
                            value={editingMcq.explanation} 
                            onChange={e => setEditingMcq({...editingMcq, explanation: e.target.value})} 
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[60px]"
                          />
                        </div>
                        <div className="flex space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <button onClick={handleSaveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition">Save Changes</button>
                          <button onClick={() => setEditingMcq(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4"><span className="text-gray-400 dark:text-gray-500 mr-2">{(page - 1) * 50 + index + 1}.</span> {mcq.question}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {mcq.options.map((opt: string, i: number) => (
                            <div key={i} className={`p-3 rounded-lg border ${mcq.correctIndex === i ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                              <span className="text-gray-400 dark:text-gray-500 mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                            </div>
                          ))}
                        </div>
                        {mcq.explanation && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 inline-block">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Explanation:</span> {mcq.explanation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    {editingMcq?._id !== mcq._id && (
                      <button onClick={() => startEditing(mcq)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition">
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(mcq._id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
