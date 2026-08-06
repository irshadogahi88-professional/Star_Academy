"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Trash2, Edit, BookOpen, Layers, Target } from "lucide-react";

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mode, setMode] = useState<"legacy" | "random" | "manual">("random");

  // Legacy/Random forms use chapters
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  
  // Test builder form state
  const [newTest, setNewTest] = useState({
    title: "",
    subjectId: "",
    chapterId: "", // for legacy
    isPublished: true,
  });

  const [randomCount, setRandomCount] = useState(10);

  // Manual MCQ Selection state
  const [availableMcqs, setAvailableMcqs] = useState<any[]>([]);
  const [selectedMcqIds, setSelectedMcqIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTests();
    fetchSubjects();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch("/api/admin/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    const res = await fetch("/api/admin/subjects");
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.subjects);
    }
  };

  // Edit state
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleSubjectChange = async (subjectId: string) => {
    setNewTest({ ...newTest, subjectId, chapterId: "" });
    setChapters([]);
    if (!subjectId) return;
    const res = await fetch(`/api/admin/chapters?subjectId=${subjectId}`);
    if (res.ok) {
      const data = await res.json();
      setChapters(data.chapters);
    }
  };

  const fetchMcqsForManual = async () => {
    if (!newTest.subjectId) return;
    const res = await fetch(`/api/admin/mcqs?subjectId=${newTest.subjectId}&limit=100`);
    if (res.ok) {
      const data = await res.json();
      setAvailableMcqs(data.mcqs);
    }
  };

  useEffect(() => {
    if (mode === "manual" && newTest.subjectId) {
      fetchMcqsForManual();
    }
  }, [mode, newTest.subjectId]);

  const toggleMcqSelection = (id: string) => {
    if (selectedMcqIds.includes(id)) {
      setSelectedMcqIds(selectedMcqIds.filter(i => i !== id));
    } else {
      setSelectedMcqIds([...selectedMcqIds, id]);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = "/api/admin/tests";
      let payload: any = { ...newTest };

      if (mode === "random") {
        endpoint = "/api/admin/tests/random";
        payload = {
          title: newTest.title,
          subjectId: newTest.subjectId,
          count: randomCount,
          isPublished: newTest.isPublished
        };
      } else if (mode === "manual") {
        endpoint = "/api/admin/tests/manual";
        payload = {
          title: newTest.title,
          subjectId: newTest.subjectId,
          mcqIds: selectedMcqIds,
          isPublished: newTest.isPublished
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewTest({ title: "", subjectId: "", chapterId: "", isPublished: true });
        setSelectedMcqIds([]);
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(`/api/admin/tests?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTests(tests.filter(t => t._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEditing = (id: string, title: string) => {
    setEditingTestId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tests?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle })
      });
      if (res.ok) {
        setTests(tests.map(t => t._id === id ? { ...t, title: editTitle } : t));
        setEditingTestId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMcqs = availableMcqs.filter(m => 
    m.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Test Builder</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Create custom tests for your students using advanced generation methods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Creator Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 sticky top-8 transition-colors">
            
            {/* Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl mb-6">
              <button 
                onClick={() => setMode("random")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${mode === 'random' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Auto-Random
              </button>
              <button 
                onClick={() => setMode("manual")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${mode === 'manual' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Manual Pick
              </button>
              <button 
                onClick={() => setMode("legacy")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${mode === 'legacy' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Chapter Base
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Test Title</label>
                <input required type="text" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="e.g. Weekly Assessment" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select required value={newTest.subjectId} onChange={e => handleSubjectChange(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition">
                  <option value="">Select a subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              {mode === "legacy" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Source Chapter</label>
                  <select required disabled={!newTest.subjectId} value={newTest.chapterId} onChange={e => setNewTest({...newTest, chapterId: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition disabled:opacity-50">
                    <option value="">Select a chapter...</option>
                    {chapters.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {mode === "random" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Number of MCQs</label>
                  <input required type="number" min="1" max="100" value={randomCount} onChange={e => setRandomCount(parseInt(e.target.value))} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">System will pick random questions from the subject.</p>
                </div>
              )}

              {mode === "manual" && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-4 rounded-xl text-sm font-bold text-center">
                  {selectedMcqIds.length} Questions Selected
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={mode === "manual" && selectedMcqIds.length === 0} className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 rounded-xl font-bold shadow-md transition disabled:opacity-50">
                  <PlusCircle className="w-5 h-5" />
                  <span>Create Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Manual Picker OR Test List */}
        <div className="lg:col-span-2">
          {mode === "manual" ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Manual Selection Bank</span>
                </h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {!newTest.subjectId ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Select a subject first to load available MCQs.</div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredMcqs.map(mcq => {
                    const isSelected = selectedMcqIds.includes(mcq._id);
                    return (
                      <div 
                        key={mcq._id} 
                        onClick={() => toggleMcqSelection(mcq._id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition ${isSelected ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 dark:bg-gray-800'}`}
                      >
                        <p className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{mcq.question}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Tests</h3>
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-1 px-3 rounded-full text-xs font-bold">
                  {tests.length} Total
                </span>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading tests...</div>
                ) : tests.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                    <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                    <p>No tests created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tests.map(test => (
                      <div key={test._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-600 shadow-sm">
                            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            {editingTestId === test._id ? (
                              <div className="flex items-center space-x-2">
                                <input 
                                  type="text" 
                                  value={editTitle} 
                                  onChange={e => setEditTitle(e.target.value)}
                                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                />
                                <button onClick={() => handleSaveEdit(test._id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded font-bold hover:bg-indigo-700">Save</button>
                                <button onClick={() => setEditingTestId(null)} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-bold hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                              </div>
                            ) : (
                              <h4 className="font-bold text-gray-900 dark:text-white">{test.title}</h4>
                            )}
                            
                            <div className="flex space-x-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded font-medium">{test.subjectId?.name || "Subject"}</span>
                              {test.mcqIds?.length > 0 && <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded font-bold">{test.mcqIds.length} Custom Qs</span>}
                              {!test.isPublished && <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded font-bold">Draft</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {editingTestId !== test._id && (
                            <button onClick={() => startEditing(test._id, test.title)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition">
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteTest(test._id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
