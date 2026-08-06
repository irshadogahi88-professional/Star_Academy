"use client";

import { useState } from "react";
import { User, Lock, Bell, Palette, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: "", type: "" });

  const handleChangePassword = async () => {
    setPassMessage({ text: "", type: "" });
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPassMessage({ text: "Please fill out all fields.", type: "error" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }
    
    setPassLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setPassMessage({ text: data.error || "Failed to update password", type: "error" });
      } else {
        setPassMessage({ text: "Password successfully updated!", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err) {
      setPassMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and global platform configurations.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 flex overflow-hidden min-h-[700px] transition-colors">
        
        {/* Settings Sidebar */}
        <div className="w-72 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <User className="w-5 h-5" />
            <span>Admin Profile</span>
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <Lock className="w-5 h-5" />
            <span>Security</span>
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
          <div className="my-6 border-t border-gray-200 dark:border-gray-800" />
          <button 
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'appearance' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
          >
            <Palette className="w-5 h-5" />
            <span>Appearance</span>
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 p-10 bg-white dark:bg-gray-900">
          
          {activeTab === "profile" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Profile Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Admin Email</label>
                  <input type="email" value={session?.user?.email || ""} disabled className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">Your email address cannot be changed directly. Contact superadmin.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                  <input type="text" defaultValue={session?.user?.name || "RK Admin"} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Organization Role</label>
                  <input type="text" defaultValue="Head Administrator" className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition" />
                </div>
                
                <button className="flex items-center space-x-2 px-8 py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 hover:-translate-y-0.5">
                  <Save className="w-5 h-5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Security & Passwords</h2>
              
              <div className="space-y-6">
                {passMessage.text && (
                  <div className={`p-4 rounded-xl border ${passMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'}`}>
                    {passMessage.text}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition" />
                </div>
                
                <button 
                  onClick={handleChangePassword} 
                  disabled={passLoading}
                  className="flex items-center space-x-2 px-8 py-4 mt-4 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  <span>{passLoading ? "Updating..." : "Update Password"}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">New Contact Messages</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get an email when a student submits a contact form.</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Weekly Analytics Report</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive a weekly summary of student test performances.</p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">System Updates</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform maintenance and feature announcements.</p>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Appearance</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Dark mode is now fully supported. Use the toggle button in the navigation bars or your system preference.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border-2 border-indigo-600 dark:border-gray-700 bg-indigo-50/30 dark:bg-gray-800 rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 w-5 h-5 bg-indigo-600 dark:bg-gray-600 rounded-full flex items-center justify-center text-white">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="w-full h-24 bg-white dark:bg-gray-700 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-600 flex flex-col p-2 space-y-2">
                    <div className="w-full h-4 bg-indigo-100 dark:bg-gray-500 rounded"></div>
                    <div className="w-1/2 h-2 bg-gray-100 dark:bg-gray-600 rounded"></div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-center">System Configured</h4>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
