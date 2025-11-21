import React from 'react';
import { AnalysisResult, getClosestGradeLabel, Course } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, gpa, courses }) => {
  if (!results) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 p-12 text-center animate-in fade-in duration-700">
        <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 p-8 rounded-full shadow-inner mb-6 animate-pulse">
          <Target className="w-16 h-16 text-violet-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-700 mb-3">Bereit für den Check?</h3>
        <p className="max-w-sm text-slate-500 leading-relaxed">Gib deine Noten ein und klicke auf "Zukunft checken".</p>
      </div>
    );
  }

  const targetGradeNum = Math.max(0.7, gpa - 0.3); 
  const chartData = [
    { name: 'Aktuell', val: gpa, label: getClosestGradeLabel(gpa) },
    { name: 'Ziel', val: targetGradeNum, label: getClosestGradeLabel(targetGradeNum) },
  ];

  return (
    <div className="space-y-8 h-auto lg:h-full lg:overflow-y-auto pr-3 custom-scrollbar pb-24 animate-in slide-in-from-right-4 duration-500">
      
      {/* Visual Grade Summary */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-center">
         <div className="flex-1 w-full h-48 relative">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Dein Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                  <YAxis domain={[0, 6]} hide reversed={true} /> 
                  <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                  <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Labels overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-around w-full font-bold text-slate-600">
                <span>{getClosestGradeLabel(gpa)} (Aktuell)</span>
                <span className="text-emerald-600">{getClosestGradeLabel(targetGradeNum)} (Ziel)</span>
            </div>
         </div>
         <div className="flex-1 space-y-4 w-full">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-sm font-bold text-violet-600 mb-1">KI Analyse</h4>
                <p className="text-slate-600 text-sm italic">"{results.advice.summary}"</p>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 p-3 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {results.advice.strengths[0] || "Gute Basis"}
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-xs font-bold text-amber-700 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    {results.advice.improvements[0] || "Potential"}
                </div>
             </div>
         </div>
      </div>

      {/* Standard Recommendations */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between px-2">
             <h3 className="text-lg font-bold text-slate-700">Passende Hochschulen</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {results.colleges.map((college, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-slate-800">{college.name}</h4>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {college.location}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    college.category === 'Optimistisch' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    college.category === 'Realistisch' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {college.category}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-2">{college.reason}</p>
              <div className="inline-block bg-slate-50 px-2 py-1 rounded text-xs text-slate-500">
                <strong>Hürde:</strong> {college.acceptanceRate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;