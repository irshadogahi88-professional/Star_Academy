"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, Database, Settings, LogOut, MessageSquare, Menu, X } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Header & Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[40]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-xs tracking-widest">RK</span>
          </div>
          <span className="font-black text-gray-900 dark:text-white">Admin<span className="text-indigo-600">.</span></span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[50]
        w-72 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-20 hidden md:flex items-center px-6 border-b border-gray-200 dark:border-gray-800 space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-sm tracking-widest">RK</span>
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Admin<span className="text-indigo-600">.</span></span>
        </div>
        
        {/* Mobile Sidebar Header */}
        <div className="h-20 md:hidden flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-black text-gray-900 dark:text-white">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="w-5 h-5 flex items-center justify-center">🏠</div>
            <span>Home Page</span>
          </Link>
          <Link 
            href="/admin" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/admin/messages" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/messages" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Inbox</span>
          </Link>
          <Link 
            href="/admin/upload" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/upload" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Upload PDF</span>
          </Link>
          <Link 
            href="/admin/tests" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/tests" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>Test Builder</span>
          </Link>
          <Link 
            href="/admin/bank" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/bank" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Database className="w-5 h-5" />
            <span>MCQ Bank</span>
          </Link>
          <Link 
            href="/admin/users" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/users" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center">👥</div>
            <span>Students</span>
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
              pathname === "/admin/settings" 
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/api/auth/signout" className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
