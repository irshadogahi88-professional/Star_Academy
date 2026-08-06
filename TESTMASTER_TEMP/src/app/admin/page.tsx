import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, FileText, Database, Activity } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { MCQ } from "@/models/MCQ";
import { Test } from "@/models/Test";

import { Attempt } from "@/models/Attempt";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  await connectToDatabase();
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Run queries in parallel
  const [totalStudents, totalMCQs, testsCreated, activeSessions] = await Promise.all([
    User.countDocuments({ role: "student" }),
    MCQ.countDocuments({ isActive: true }),
    Test.countDocuments(),
    Attempt.countDocuments({ startedAt: { $gte: oneDayAgo } })
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {session?.user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalStudents}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total MCQs</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalMCQs}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Created</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{testsCreated}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeSessions}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
