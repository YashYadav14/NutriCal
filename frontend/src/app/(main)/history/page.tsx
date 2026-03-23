"use client";

import React, { useEffect, useState } from "react";
import { getDietHistory, SavedDietPlan } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Clock, Utensils } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function HistoryPage() {
  const [history, setHistory] = useState<SavedDietPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDietHistory()
      .then((data) => setHistory(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const parseJson = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans py-12 px-6 sm:px-12 selection:bg-black selection:text-white">
      <div className="max-w-[1200px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black font-semibold tracking-wide text-sm mb-12 transition-colors">
          <ArrowLeft size={16} strokeWidth={2.5} /> DASHBOARD
        </Link>
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-100/80 p-3 rounded-2xl"><Clock size={28} className="text-black" /></div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-black tracking-tighter">Your Protocol History</h1>
          </div>
          <p className="text-lg text-gray-500 font-medium">Review and revisit your previously generated AI nutritional plans.</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-20 bg-gray-50/50 border-dashed border-2">
            <div className="bg-white w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm">
               <Utensils className="text-gray-300" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">No history found</h3>
            <p className="text-gray-500 mt-2 font-medium">Generate your first AI diet plan to see it here.</p>
            <Link href="/diet" className="inline-block mt-8 bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
               Generate Plan Now
            </Link>
          </Card>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {history.map((plan) => {
                const rawWeekly = plan.weeklyPlanJson || (plan as any).weeklyPlan || (plan as any).weekly_plan;
                const rawDaily = plan.mealPlanJson;
                
                let mealPreview: Record<string, any> = {};
                let isWeekly = false;
                
                if (rawWeekly) {
                    const parsedWeekly = parseJson(rawWeekly);
                    // Use monday as the preview day
                    mealPreview = parsedWeekly.monday || parsedWeekly; 
                    isWeekly = true;
                } else {
                    mealPreview = parseJson(rawDaily);
                }
                
                return (
                  <motion.div key={plan.id} variants={itemVariants}>
                    <Card className="h-full hover:-translate-y-2 transition-transform duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                          <Clock size={14}/> {formatDate(plan.createdAt)} {isWeekly && " (7-DAY)"}
                        </span>
                        <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded-full">
                          {plan.calories} KCAL
                        </span>
                      </div>
                      <CardContent className="flex-1 p-6 space-y-6">
                        {/* Macros Compact */}
                        <div className="flex justify-between items-center px-2">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pro</p>
                            <p className="text-lg font-black">{plan.protein}g</p>
                          </div>
                          <div className="w-[1px] h-8 bg-gray-100"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Carb</p>
                            <p className="text-lg font-black">{plan.carbs}g</p>
                          </div>
                          <div className="w-[1px] h-8 bg-gray-100"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Fat</p>
                            <p className="text-lg font-black">{plan.fats}g</p>
                          </div>
                        </div>

                        {/* Meal Plan Preview */}
                        <div className="pt-4 border-t border-gray-50">
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Utensils size={14} /> Meals Preview</h4>
                           <ul className="space-y-3">
                             {Object.entries(mealPreview)
                               .filter(([k, v]) => typeof v === 'string') // protect against nested objects
                               .slice(0, 3)
                               .map(([mealName, description]) => (
                               <li key={mealName} className="text-sm">
                                 <span className="font-semibold capitalize text-gray-900">{mealName}:</span> <span className="text-gray-600 line-clamp-1">{description as string}</span>
                               </li>
                             ))}
                             {Object.keys(mealPreview).length > 3 && (
                               <li className="text-xs font-semibold text-gray-400 italic">...plus more</li>
                             )}
                           </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
