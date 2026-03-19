import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Lock, TrendingUp, BarChart } from 'lucide-react';

const RankingHistoryChart = ({ history, isLocked }) => {
    // Format data for Recharts
    const data = history?.map(h => ({
        date: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        rank: h.rank,
        reviews: h.reviews
    })) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                    <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-600">Rank:</span>
                            <span className="text-sm font-black text-blue-600">#{payload[0].value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-600">Reviews:</span>
                            <span className="text-sm font-black text-green-600">{payload[1]?.value || 0}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        Ranking History & Growth
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Movement of top-ranking business over time</p>
                </div>
                <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                        Historical Data
                    </span>
                </div>
            </div>

            <div className={`h-[300px] w-full transition-all duration-700 ${isLocked ? 'blur-md grayscale opacity-40' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis 
                            reversed={true} // Lower rank is better
                            domain={[1, 'dataMax']}
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="rank" 
                            stroke="#2563eb" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorRank)" 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="reviews" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            dot={false}
                            opacity={0.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6 text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-bounce">
                        <Lock size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">Unlock Historical Trends</h4>
                    <p className="text-slate-600 max-w-sm mb-6 font-medium">
                        Analyze how rankings fluctuate and track review growth velocity with interactive historical charts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                            href="/register" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-xl flex items-center gap-2"
                        >
                            Create Free Account
                        </a>
                        <button 
                            className="bg-white border border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RankingHistoryChart;
