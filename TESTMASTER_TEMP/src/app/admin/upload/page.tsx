"use client";

import { useState, useRef, useEffect } from "react";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [parsedMcqs, setParsedMcqs] = useState<any[]>([]);
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isNewSubject, setIsNewSubject] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [testTitle, setTestTitle] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await fetch("/api/admin/subjects");
    if (res.ok) {
      const data = await res.json();
      setSubjects(data.subjects);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setParsedMcqs([]);
      
      // Auto-fill chapter name and test title with file name (without extension)
      const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
      setChapterName(fileName);
      setTestTitle(`${fileName} Test`);
    }
  };

  // File processing logic moved to backend `/api/admin/upload`

  const saveToDatabase = async (mcqs: any[], subjName: string, chapName: string, subjId: string, title: string) => {
    const res = await fetch("/api/admin/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        mcqs, 
        subjectName: subjName, 
        chapterName: chapName,
        subjectId: subjId,
        testTitle: title
      })
    });
    
    if (!res.ok) {
      let errorMessage = "Failed to save to database";
      try {
        const errorData = await res.json();
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    
    return true;
  };

  const handleProcess = async () => {
    if (!file) return;
    if (isNewSubject && !subjectName) {
      setErrorMessage("Please enter a subject name");
      return;
    }
    if (!isNewSubject && !selectedSubjectId) {
      setErrorMessage("Please select a subject");
      return;
    }
    if (!chapterName) {
      setErrorMessage("Please enter a chapter / document name");
      return;
    }

    try {
      setStatus("uploading");
      setErrorMessage("");
      
      const fileBuffer = await file.arrayBuffer();
      
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": file.type || "application/pdf" },
        body: fileBuffer
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process PDF");
      }
      
      setStatus("processing");
      const data = await res.json();
      const generatedMcqs = data.mcqs;
      setParsedMcqs(generatedMcqs);
      
      await saveToDatabase(generatedMcqs, subjectName, chapterName, selectedSubjectId, testTitle);
      
      setStatus("success");
      toast.success("MCQs extracted and saved successfully!");
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      const errorMsg = error.message || "An error occurred during processing";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Documents</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload your PDF materials to automatically extract and generate MCQs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
          <div className="space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject Target</label>
              <div className="flex space-x-2 mb-3">
                <button 
                  onClick={() => setIsNewSubject(false)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${!isNewSubject ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  Existing Subject
                </button>
                <button 
                  onClick={() => setIsNewSubject(true)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${isNewSubject ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  New Subject
                </button>
              </div>

              {isNewSubject ? (
                <input 
                  type="text" 
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Biology, Physics..."
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              ) : (
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Chapter / Document Name</label>
              <input 
                type="text" 
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g. Chapter 1: Cell Structure"
                className="w-full p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Questions will be grouped under this chapter for easy filtering.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Test Title (For Students)</label>
              <input 
                type="text" 
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. Biology Quiz 1"
                className="w-full p-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This is the title students will see when starting the test.</p>
            </div>

            <div 
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
                file ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.doc,.docx" 
                className="hidden" 
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                  <p className="text-gray-900 dark:text-white font-bold text-lg">{file.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button className="mt-4 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">Change File</button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <UploadIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">Click to browse or drag and drop</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">PDF or Word Documents only</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleProcess}
              disabled={!file || status === 'uploading' || status === 'processing' || status === 'success'}
              className="w-full py-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {(status === 'uploading' || status === 'processing') ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin"></div>
              ) : (
                <UploadIcon className="w-5 h-5" />
              )}
              <span>
                {status === 'idle' && "Process & Extract MCQs"}
                {status === 'uploading' && "Reading Document..."}
                {status === 'processing' && "AI is analyzing text..."}
                {status === 'success' && "Extraction Complete!"}
                {status === 'error' && "Try Again"}
              </span>
            </button>
          </div>
        </div>

        {/* Status / Output Display */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col transition-colors">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Extraction Pipeline</h3>
          
          <div className="flex-1 space-y-4">
            <div className={`flex items-center space-x-4 p-4 rounded-xl border ${status !== 'idle' ? 'border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-gray-800 shadow-sm' : 'border-transparent text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${status !== 'idle' ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-gray-300 dark:border-gray-700'}`}>
                1
              </div>
              <span className="font-bold">Text Extraction</span>
              {(status === 'processing' || status === 'success') && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
            </div>

            <div className={`flex items-center space-x-4 p-4 rounded-xl border ${(status === 'processing' || status === 'success') ? 'border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-gray-800 shadow-sm' : 'border-transparent text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${(status === 'processing' || status === 'success') ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-gray-300 dark:border-gray-700'}`}>
                2
              </div>
              <span className="font-bold">AI Analysis & Formatting</span>
              {status === 'success' && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
            </div>

            <div className={`flex items-center space-x-4 p-4 rounded-xl border ${status === 'success' ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 shadow-sm' : 'border-transparent text-gray-400 dark:text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${status === 'success' ? 'border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-gray-300 dark:border-gray-700'}`}>
                3
              </div>
              <span className="font-bold">Database Save</span>
              {status === 'success' && <Check className="w-5 h-5 text-emerald-500 ml-auto" />}
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-400 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && parsedMcqs.length > 0 && (
            <div className="mt-6 p-6 bg-indigo-600 dark:bg-indigo-500 rounded-2xl text-white text-center shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <CheckCircle className="w-10 h-10 mx-auto mb-3" />
              <h4 className="text-xl font-bold">Successfully Extracted!</h4>
              <p className="mt-1 text-indigo-100">Saved {parsedMcqs.length} multiple-choice questions to the bank.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
