"use client";

import React, { useEffect, useState } from 'react';
import { 
  getBmiHistory, getCaloriesHistory, getMacrosHistory, 
  BMIRecord, CaloriesRecord, MacrosRecord 
} from '@/lib/api';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
import { 
  Flame, Target, TrendingUp, Info, Activity, Dumbbell 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [bmiData, setBmiData] = useState<BMIRecord[]>([]);
  const [caloriesData, setCaloriesData] = useState<CaloriesRecord[]>([]);
  const [macrosData, setMacrosData] = useState<MacrosRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bmiRes, calRes, macRes] = await Promise.all([
          getBmiHistory(),
          getCaloriesHistory(),
          getMacrosHistory()
        ]);
        setBmiData(bmiRes);
        setCaloriesData(calRes);
        setMacrosData(macRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load progress data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Derived Stats
  const latestBmi = bmiData.length > 0 ? bmiData[bmiData.length - 1] : null;
  const latestCal = caloriesData.length > 0 ? caloriesData[caloriesData.length - 1] : null;
  const latestMac = macrosData.length > 0 ? macrosData[macrosData.length - 1] : null;

  const todayCalories = latestCal?.goalCalories ?? 0;
  const todayProtein = latestMac?.proteinGrams ?? 0;
  const currentBmi = latestBmi?.bmi ?? 0;
  const currentGoal = latestCal?.goal ?? 'MAINTAIN';

  // AI Insight Logic
  let aiInsight = "Set up your macros to get personalized AI insights.";
  if (latestMac) {
    if ((latestMac?.proteinPercent ?? 0) < 20) {
      aiInsight = "Increase protein intake to support muscle recovery and satiety.";
    } else if ((latestMac?.carbPercent ?? 0) > 60) {
      aiInsight = "Consider reducing carbs to balance your energy levels throughout the day.";
    } else {
      aiInsight = "You're balanced! Your current macronutrient split looks excellent.";
    }
  }

  // Chart Data formatters
  const weightTrend = bmiData.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: d.weightKg
  }));

  const calTrend = caloriesData.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    calories: d.goalCalories
  }));

  const pieData = latestMac ? [
    { name: 'Protein', value: latestMac?.proteinGrams ?? 0, color: '#3b82f6' },
    { name: 'Carbs', value: latestMac?.carbGrams ?? 0, color: '#f97316' },
    { name: 'Fats', value: latestMac?.fatGrams ?? 0, color: '#10b981' }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Progress Dashboard</h1>
          <p className="text-slate-500 mt-2">Track your nutrition goals and insights over time.</p>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Calories Today" 
            value={`${todayCalories} kcal`} 
            icon={<Flame className="text-orange-500 w-6 h-6" />} 
          />
          <StatCard 
            title="Protein Today" 
            value={`${Math.round(todayProtein)}g`} 
            icon={<Dumbbell className="text-blue-500 w-6 h-6" />} 
          />
          <StatCard 
            title="Current BMI" 
            value={currentBmi.toFixed(1)} 
            icon={<Activity className="text-emerald-500 w-6 h-6" />} 
          />
          <StatCard 
            title="Goal Progress" 
            value={currentGoal} 
            icon={<Target className="text-indigo-500 w-6 h-6" />} 
          />
        </div>

        {/* Middle Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Weight Trend">
            {weightTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weightTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No weight history found." />
            )}
          </ChartCard>

          <ChartCard title="Calories Trend">
            {calTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={calTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No calories history found." />
            )}
          </ChartCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
            <h3 className="font-semibold text-slate-800 tracking-tight mb-4">Latest Macros</h3>
            {pieData.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-4 mt-2">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center text-sm font-medium text-slate-600">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      {item.name}: {Math.round(item.value)}g
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No macros calculated yet." />
            )}
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex items-start">
              <div className="bg-indigo-100 p-3 rounded-xl mr-6">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">AI Diet Insight</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {aiInsight}
                </p>
                <div className="mt-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Updated based on latest data
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const StatCard = React.memo(function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center"
    >
      <div className="bg-slate-50 p-4 rounded-2xl mr-5">
        {icon}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
});

const ChartCard = React.memo(function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-800 tracking-tight mb-6">{title}</h3>
      {children}
    </div>
  );
});

const EmptyState = React.memo(function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-sm">
      {message}
    </div>
  );
});

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-10 w-64 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-slate-200 rounded-lg mb-10" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl shadow-sm border border-slate-100" />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl shadow-sm border border-slate-100" />
          <div className="h-80 bg-white rounded-2xl shadow-sm border border-slate-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-64 bg-white rounded-2xl shadow-sm border border-slate-100" />
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
