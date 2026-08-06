"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, BrainCircuit, MessageSquare, Send, Heart, Coffee, ShieldAlert, Target, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [formState, setFormState] = useState({ name: "", emailOrNumber: "", title: "", details: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormState({ name: "", emailOrNumber: "", title: "", details: "" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors overflow-x-hidden">

      {/* Notice Banner */}
      <div className="bg-indigo-600 text-white text-sm font-medium py-2.5 px-4 text-center flex items-center justify-center space-x-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span>For now it's focused on <strong>MCAT</strong>. We are rapidly expanding to ECAT, Entrance Tests, and Government practice tests!</span>
      </div>

      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex-shrink-0">
                <span className="text-white font-extrabold text-sm tracking-widest">RK</span>
              </div>
              <span className="hidden sm:inline text-2xl font-black text-gray-900 dark:text-white tracking-tight">TestMaster<span className="text-indigo-600 dark:text-indigo-400">.</span></span>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/search" className="hidden sm:block text-indigo-600 dark:text-indigo-400 font-bold transition">Search MCQs</Link>
              <ThemeToggle />
              <Link href="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-bold transition hidden md:block">Sign In</Link>
              <Link href="/signup" className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-black dark:hover:bg-gray-100 transition shadow-lg shadow-gray-200 dark:shadow-none hover:-translate-y-0.5 whitespace-nowrap">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-32 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full -z-10"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 blur-[120px] rounded-full -z-10"></div>

          <div className="inline-flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-indigo-700 dark:text-indigo-400 px-5 py-2 rounded-full font-bold text-sm mb-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>100% Free Practice Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-8 max-w-5xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Attempt tests. Track your progress. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-[length:200%_auto] animate-gradient">Enhance your knowledge.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            We provide a completely free exam environment with a vast library of past papers and expected MCQs. Get personalized AI analytics to highlight your strong and weak areas.
          </p>

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 w-full sm:w-auto px-4 sm:px-0">
            <Link href="/signup" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-600/20 dark:shadow-indigo-900/50 transition-all hover:scale-105 flex items-center justify-center space-x-2">
              <span>Log In & Attempt Tests</span>
              <BookOpen className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-white dark:bg-gray-900 py-24 border-y border-gray-100 dark:border-gray-800 transition-colors relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Everything you need to ace your exams.</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">Stop guessing what to study. Let data guide your preparation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Free Exam Environment</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Simulate real exams with strict timers, or learn at your own pace with instant explanations in Practice mode. All completely free.</p>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Analytics & Reports</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Our beautiful dashboard tracks your scores and automatically visualizes your strong and weak subjects so you know what to focus on.</p>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20 transition-all duration-300 group">
                <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-purple-500 dark:text-purple-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Massive Question Bank</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">Access a constantly growing repository of past papers and highly expected MCQs generated by AI, covering every topic.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/10">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Request a feature or past paper</h2>
              <p className="text-gray-400 text-lg">Can't find what you're looking for? Drop us a message.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-10 text-center animate-in fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-emerald-200">Thank you for reaching out. We will review your message shortly.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-emerald-400 font-bold hover:text-emerald-300">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Your Name</label>
                    <input required type="text" value={formState.name} onChange={e => setFormState({ ...formState, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Khan" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Email or Phone Number</label>
                    <input required type="text" value={formState.emailOrNumber} onChange={e => setFormState({ ...formState, emailOrNumber: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="khanchachar@.com" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Subject Title</label>
                  <input required type="text" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="need help | sugestion | feedback ..." />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Details</label>
                  <textarea required rows={4} value={formState.details} onChange={e => setFormState({ ...formState, details: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none" placeholder="Provide more details here..."></textarea>
                </div>
                <button disabled={submitting} type="submit" className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center transition-colors relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 mb-12 shadow-sm transition-colors">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Help Us Expand The Platform</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              If you want more tests and want to help us out, please share proper DOCX or PDF tests with answers and explanations to the WhatsApp number below. Thanks in advance!
            </p>
            <a href="https://wa.me/923278937768" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 font-medium mb-4">
            <Link href="/admin" className="hover:text-indigo-600 transition">Admin Login</Link>
            <span>•</span>
            <span>Built with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
            <span>&</span>
            <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-500" />
            <span>by</span>
            <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">RK</span>
          </div>
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-4">&copy; {new Date().getFullYear()} TestMaster RK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
