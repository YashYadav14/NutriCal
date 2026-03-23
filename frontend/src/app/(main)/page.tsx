"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Utensils, Zap, ChartPie, ArrowRight, Sparkles, LogOut, User } from "lucide-react";
import dynamic from "next/dynamic";
import { getBmiHistory, getCaloriesHistory, getMacrosHistory, BMIRecord, CaloriesRecord, MacrosRecord, logout } from "@/lib/api";

const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

const MACRO_COLORS = ['#3b82f6', '#f97316', '#10b981']; // Blue, Orange, Emerald



export default function Dashboard() {
  const [bmiData, setBmiData] = useState<BMIRecord[]>([]);
  const [calData, setCalData] = useState<CaloriesRecord[]>([]);
  const [macroData, setMacroData] = useState<MacrosRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>("");

  // ── Dashboard metric state (latest record values) ──────────────────────────
  const [weight, setWeight] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");
  const [calories, setCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ proteinGrams: number; carbGrams: number; fatGrams: number } | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "You");
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bmiHistory, caloriesHistory, macrosHistory] = await Promise.all([
        getBmiHistory().catch(() => [] as BMIRecord[]),
        getCaloriesHistory().catch(() => [] as CaloriesRecord[]),
        getMacrosHistory().catch(() => [] as MacrosRecord[]),
      ]);

      // Sort ascending for time series charts
      const sortedBmi = [...bmiHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const sortedCal = [...caloriesHistory].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      const sortedMacro = [...macrosHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // desc for latest-first

      setBmiData(sortedBmi);
      setCalData(sortedCal);
      setMacroData(sortedMacro);

      // Extract latest values for metric cards
      if (sortedBmi.length > 0) {
        const latest = sortedBmi[sortedBmi.length - 1];
        setWeight(latest.weightKg);
        setBmiCategory(latest.category);
      }
      if (sortedCal.length > 0) {
        const latest = sortedCal[sortedCal.length - 1];
        setCalories(latest.goalCalories);
      }
      if (sortedMacro.length > 0) {
        const latest = sortedMacro[0]; // already sorted desc
        setMacros({
          proteinGrams: latest?.proteinGrams ?? 0,
          carbGrams: latest?.carbGrams ?? 0,
          fatGrams: latest?.fatGrams ?? 0,
        });
      }
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const latestCal = calData.length > 0 ? calData[calData.length - 1] : null;
  const latestMacro = macroData.length > 0 ? macroData[0] : null;

  // Format dataset for Charts
  const bmiChartData = bmiData.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bmi: d.bmi
  }));

  const calChartData = calData.map(d => ({
    date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    intake: d.tdee,
    goal: d.goalCalories
  }));

  const macroPieData = latestMacro ? [
    { name: 'Protein', value: latestMacro?.proteinPercent ?? 0 },
    { name: 'Carbs', value: latestMacro?.carbPercent ?? 0 },
    { name: 'Fats', value: latestMacro?.fatPercent ?? 0 }
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-[#FDFDFD] text-gray-900 font-sans selection:bg-black selection:text-white">


      <main className="max-w-[1200px] mx-auto py-12 px-6 sm:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-black">Welcome back, {username}.</h2>
          <p className="text-xl text-gray-500 mt-4 font-medium max-w-2xl">Here is a quick overview of your health metrics and AI generation targets for today.</p>
        </motion.div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Loading your data...</div>
        ) : (
          <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Metric Cards mapped to Live Data */}
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 group hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500"><Activity size={100} /></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="bg-gray-50 p-3.5 rounded-2xl text-black border border-gray-100"><Activity size={22} /></div>
                  {bmiCategory && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 pb-1.5 rounded-full border border-emerald-100/50">{bmiCategory}</span>}
                </div>
                <div className="relative z-10">
                  <h3 className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Current Weight</h3>
                  <p className="text-4xl font-extrabold tracking-tight mt-2 text-black">{weight ?? "--"}<span className="text-xl text-gray-400 font-medium ml-1">kg</span></p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 group hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500"><Zap size={100} /></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="bg-gray-50 p-3.5 rounded-2xl text-black border border-gray-100"><Zap size={22} className="fill-black/5" /></div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Daily Target</h3>
                  <p className="text-4xl font-extrabold tracking-tight mt-2 text-black">{calories ?? (latestCal ? latestCal.goalCalories : "--")}<span className="text-xl text-gray-400 font-medium ml-1">kcal</span></p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 group hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500"><ChartPie size={100} /></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="bg-gray-50 p-3.5 rounded-2xl text-black border border-gray-100"><ChartPie size={22} /></div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Macro Split</h3>
                  <div className="flex gap-4 mt-3">
                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PRO</span> <span className="text-2xl font-black mt-1">{macros?.proteinGrams ?? latestMacro?.proteinGrams ?? "--"}<span className="text-sm font-medium text-gray-400">g</span></span></div>
                    <div className="w-[1px] h-8 bg-gray-100 my-auto"></div>
                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">CRB</span> <span className="text-2xl font-black mt-1">{macros?.carbGrams ?? latestMacro?.carbGrams ?? "--"}<span className="text-sm font-medium text-gray-400">g</span></span></div>
                    <div className="w-[1px] h-8 bg-gray-100 my-auto"></div>
                    <div className="flex flex-col"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">FAT</span> <span className="text-2xl font-black mt-1">{macros?.fatGrams ?? latestMacro?.fatGrams ?? "--"}<span className="text-sm font-medium text-gray-400">g</span></span></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Recharts Data Visualization Dashboard */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              
              {/* BMI Trend Line Chart */}
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500">
                <h3 className="text-lg font-bold tracking-tight mb-6">BMI Trend</h3>
                <div className="h-64 w-full">
                  {bmiChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bmiChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                        <YAxis domain={['auto', 'auto']} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                        <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-sm text-gray-400">No BMI data available</div>}
                </div>
              </motion.div>

              {/* Calories Bar Chart */}
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500">
                <h3 className="text-lg font-bold tracking-tight mb-6">Calories Target vs Goal</h3>
                <div className="h-64 w-full">
                  {calChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={calChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                        <Bar dataKey="intake" name="TDEE" fill="#d1d5db" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="goal" name="Target" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full flex items-center justify-center text-sm text-gray-400">No calorie data available</div>}
                </div>
              </motion.div>

              {/* Macros Breakdown Pie Chart */}
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-all duration-500 lg:col-span-2">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-bold tracking-tight mb-2">Detailed Macro Breakdown</h3>
                    <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">Visual representation of your latest macro distribution targets (Protein, Carbohydrates, and Fats).</p>
                    
                    {latestMacro ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm font-bold text-gray-700 w-16">Protein</span><span className="text-sm text-gray-500 font-medium">{latestMacro?.proteinPercent ?? 0}%</span></div>
                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-sm font-bold text-gray-700 w-16">Carbs</span><span className="text-sm text-gray-500 font-medium">{latestMacro?.carbPercent ?? 0}%</span></div>
                        <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-sm font-bold text-gray-700 w-16">Fats</span><span className="text-sm text-gray-500 font-medium">{latestMacro?.fatPercent ?? 0}%</span></div>
                      </div>
                    ) : <div className="text-sm text-gray-400">No macro data available</div>}
                  </div>
                  
                  <div className="h-64 w-full md:w-1/2 mt-8 md:mt-0">
                    {macroPieData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {macroPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }} itemStyle={{ color: '#111827' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* AI Chat Card CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group hover:bg-indigo-50 transition-colors">
            <div className="flex items-center gap-6">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <Sparkles size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-indigo-950 tracking-tight">Need a quick adjustment?</h3>
                <p className="text-indigo-800/80 font-medium mt-1">Chat directly with your AI Nutrition Coach to tweak meals or ask questions.</p>
              </div>
            </div>
            <Link href="/chat" className="shrink-0 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
               Open Coach Chat
            </Link>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="bg-black text-white rounded-[2.5rem] p-12 md:p-16 shadow-[0_20px_50px_rgb(0,0,0,0.2)] relative overflow-hidden group mb-12"
        >
          <div className="absolute -right-20 -top-20 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000">
            <Utensils size={400} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Powered by Gemini 1.5 Pro
            </div>
            <h2 className="text-5xl md:text-6xl font-tighter font-extrabold mb-6 tracking-tight leading-tight">Your perfect diet, <br/>generated in seconds.</h2>
            <p className="text-gray-400 mb-10 text-xl font-medium leading-relaxed">Stop guessing your calories. Let our advanced AI calculate your exact macros and build a hyper-personalized, delicious meal plan instantly.</p>
            <Link href="/diet" className="inline-flex items-center gap-3 bg-white text-black hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] text-lg">
               Generate AI Plan <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
