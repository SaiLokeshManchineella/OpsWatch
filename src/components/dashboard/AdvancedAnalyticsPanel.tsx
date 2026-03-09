import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Users } from 'lucide-react';
import { InsightsData } from '@/lib/api-client';

interface AdvancedAnalyticsPanelProps {
    insights: InsightsData;
}

export const AdvancedAnalyticsPanel: React.FC<AdvancedAnalyticsPanelProps> = ({ insights }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const onPieLeave = () => {
        setActiveIndex(null);
    };

    const totalTasks = insights.by_status.reduce((sum, s) => sum + s.value, 0);

    return (
        <div className="space-y-6">
            {/* Top Banner KPI row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-panel p-6 rounded-2xl card-hover flex items-center gap-5 border border-white/5 group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                        <TrendingUp className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Completion Rate</p>
                        <h3 className="text-3xl font-extrabold text-foreground outfit-font">{insights.completion_percentage}%</h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl card-hover flex items-center gap-5 border border-white/5 group">
                    <div className="w-14 h-14 rounded-2xl bg-danger/20 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                        <Clock className="w-7 h-7 text-danger" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Delay Time</p>
                        <h3 className="text-3xl font-extrabold text-foreground outfit-font">{insights.avg_delay_hours} <span className="text-sm font-normal text-muted-foreground">hrs</span></h3>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl card-hover flex items-center gap-5 border border-white/5 group">
                    <div className="w-14 h-14 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
                        <AlertTriangle className="w-7 h-7 text-warning" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">% Tasks Delayed</p>
                        <h3 className="text-3xl font-extrabold text-foreground outfit-font">
                            {totalTasks > 0 ? Math.round((insights.by_status.find(s => s.label === 'Delayed')?.value || 0) / totalTasks * 100) : 0}%
                        </h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Team Workload Distribution - Bar Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground outfit-font">Workload by Team</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Task assignment density</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={insights.by_team} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--foreground) / 0.05)', radius: 4 }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover) / 0.9)',
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        border: '1px solid hsl(var(--border) / 0.2)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
                                />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                    {insights.by_team.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Breakdown - Pie Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-warning/10">
                                <AlertTriangle className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground outfit-font">Priority Breakdown</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Criticality distribution</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={insights.by_priority}
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={8}
                                    dataKey="value"
                                    nameKey="label"
                                    stroke="none"
                                    onMouseEnter={onPieEnter}
                                    onMouseLeave={onPieLeave}
                                    onClick={onPieEnter}
                                >
                                    {insights.by_priority.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            className="outline-none transition-all duration-300 cursor-pointer"
                                            style={{
                                                filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 8px ' + entry.color + '44)' : 'none',
                                                transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                                                transformOrigin: 'center'
                                            }}
                                        />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Dynamic Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transform -translate-y-4">
                            {activeIndex !== null ? (
                                <div className="text-center animate-fade-in">
                                    <span className="text-5xl font-extrabold outfit-font tracking-tight block" style={{ color: insights.by_priority[activeIndex].color }}>
                                        {insights.by_priority[activeIndex].value}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1 block">
                                        {insights.by_priority[activeIndex].label} Tasks
                                    </span>
                                </div>
                            ) : (
                                <div className="text-center animate-fade-in">
                                    <span className="text-4xl font-extrabold text-foreground outfit-font tracking-tight block">
                                        {insights.by_priority.reduce((sum, item) => sum + item.value, 0)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mt-1 block">Total Tasks</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
