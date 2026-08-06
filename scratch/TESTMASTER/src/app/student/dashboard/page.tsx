import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, TrendingUp, LogOut, ArrowRight, Search } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";
import { MCQ } from "@/models/MCQ";
import { Attempt } from "@/models/Attempt";
import "@/models/Subject";
import "@/models/Chapter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StudentAnalytics } from "@/components/StudentAnalytics";

export const dynamic = 'force-dynamic';

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const resolvedParams = await searchParams;
  const currentSubject = resolvedParams?.subject || "All";
  
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.role === "admin") {
    redirect("/admin");
  }

  await connectToDatabase();
  const userId = (session.user as any).id;

  // Fetch Tests
  const tests = await Test.find({ isPublished: true })
    .populate({ path: "subjectId", select: "name" })
    .populate({ path: "chapterId", select: "name" })
    .sort({ createdAt: -1 })
    .lean();

  const chapterIds = tests.map((t: any) => t.chapterId?._id).filter(Boolean);
  
  const mcqCounts = await MCQ.aggregate([
    { $match: { chapterId: { $in: chapterIds }, isActive: true } },
    { $group: { _id: "$chapterId", count: { $sum: 1 } } }
  ]);

  const countMap = mcqCounts.reduce((acc: any, curr: any) => {
    acc[curr._id.toString()] = curr.count;
    return acc;
  }, {});

  // Filter tests based on current subject
  const filteredTests = currentSubject === "All" 
    ? tests 
    : tests.filter((t: any) => {
        const subjName = (t.subjectId as any)?.name || "";
        return subjName.toLowerCase() === currentSubject.toLowerCase();
      });

  // Fetch Attempts for Analytics
  const attempts = await Attempt.find({ userId })
    .populate({
      path: "testId",
      populate: { path: "subjectId", select: "name" }
    })
    .lean();

  // Calculate top-level stats
  const totalTestsTaken = attempts.length;
  const avgScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a: any) => sum + (a.percentage || 0), 0) / attempts.length) 
    : 0;

  let totalTimeSec = 0;
  attempts.forEach((a: any) => {
    if (a.answers) {
      a.answers.forEach((ans: any) => {
        totalTimeSec += (ans.timeTakenSec || 0);
      });
    }
  });
  const timeHours = Math.floor(totalTimeSec / 3600);
  const timeMinutes = Math.floor((totalTimeSec % 3600) / 60);
  const timeDisplay = totalTimeSec > 0 ? (timeHours > 0 ? `${timeHours}h ${timeMinutes}m` : `${timeMinutes}m`) : "0m";

  // Calculate Subject Analytics
  const subjectStats: Record<string, { totalScore: number; count: number }> = {};
  attempts.forEach((a: any) => {
    if (!a.testId || !a.testId.subjectId) return;
    const subjName = a.testId.subjectId.name;
    if (!subjectStats[subjName]) subjectStats[subjName] = { totalScore: 0, count: 0 };
    subjectStats[subjName].totalScore += (a.percentage || 0);
    subjectStats[subjName].count += 1;
  });

  const chartData = Object.keys(subjectStats).map(subj => ({
    subject: subj,
    score: Math.round(subjectStats[subj].totalScore / subjectStats[subj].count)
  }));

  const filterOptions = ["All", "Biology", "English", "Physics", "Chemistry", "LR"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex-shrink-0">
                  <span className="text-white font-extrabold text-sm tracking-widest">RK</span>
                </div>
                <span className="hidden sm:inline text-xl font-black text-gray-900 dark:text-white tracking-tight">StudentPortal<span className="text-indigo-600 dark:text-indigo-400">.</span></span>
              </div>
              <div className="flex space-x-4 sm:space-x-6">
                <Link href="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium px-1 py-7 transition">Home</Link>
                <Link href="/student/dashboard" className="hidden sm:inline text-indigo-600 font-bold border-b-2 border-indigo-600 px-1 py-7">Dashboard</Link>
                <Link href="/search" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium px-1 py-7 flex items-center space-x-2 transition">
                  <Search className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Search MCQs</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeToggle />
              <span className="text-gray-700 dark:text-gray-300 font-medium hidden sm:block truncate max-w-[100px]">{session.user?.name}</span>
              <Link href="/api/auth/signout" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 p-2 rounded-xl flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-start space-x-3 text-amber-800 dark:text-amber-400">
          <div className="font-medium text-sm">
            <span className="font-bold uppercase tracking-wider mr-2">Notice:</span>
            Errors and omissions possible. For any correction, feel free to send us a message through the contact form on the website or via WhatsApp.
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {session.user?.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Track your progress and ace your next exam.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-5 transition-colors">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Tests Attempted</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalTestsTaken}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-5 transition-colors">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Average Score</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{avgScore}%</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-5 transition-colors">
            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Time Spent</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{timeDisplay}</h3>
            </div>
          </div>
        </div>

        {/* Analytics Chart Row */}
        <div className="mb-12">
          <StudentAnalytics data={chartData} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Available Tests</h3>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {filterOptions.map(opt => (
              <Link 
                key={opt}
                href={`/student/dashboard${opt === "All" ? "" : `?subject=${opt}`}`}
                scroll={false}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${
                  currentSubject.toLowerCase() === opt.toLowerCase() 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {opt}
              </Link>
            ))}
          </div>
        </div>
        
        {filteredTests.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
            <div className="mx-auto w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">No tests available right now</h4>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later when the admin publishes new tests for you to attempt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTests.map((test: any) => {
              const qCount = test.mcqIds && test.mcqIds.length > 0 
                ? test.mcqIds.length 
                : (countMap[test.chapterId?._id?.toString()] || 0);
                
              return (
                <div key={test._id.toString()} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col h-full hover:shadow-xl dark:hover:shadow-indigo-900/10 transition group">
                  <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-bold tracking-widest uppercase mb-4">
                      {(test.subjectId as any)?.name || "General"}
                    </div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3">{(test.chapterId as any)?.name || "Chapter"}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">This test contains {qCount} multiple-choice questions designed to test your knowledge.</p>
                  </div>
                  
                  <Link href={`/student/test/${test._id}`} className="w-full py-4 px-4 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2">
                    <span>Start Test</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
