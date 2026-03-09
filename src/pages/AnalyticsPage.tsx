import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { AdvancedAnalyticsPanel } from '@/components/dashboard/AdvancedAnalyticsPanel';
import { getDashboardInsights, InsightsData } from '@/lib/api-client';
import { useTasks } from '@/context/TaskContext';

const AnalyticsPage: React.FC = () => {
    const { tasks, isLoading: contextLoading } = useTasks();
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await getDashboardInsights();
            setInsights(data);
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    // Re-fetch when tasks change (e.g. from WebSockets)
    useEffect(() => {
        if (!contextLoading) {
            fetchAnalytics();
        }
    }, [tasks, contextLoading]);

    return (
        <div>
            <Header title="Analytics" subtitle="Deep dive into your operational metrics" />
            <div className="p-6 space-y-6 animate-fade-slide-up">
                {loading && !insights ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : (
                    insights && (
                        <div className="max-w-5xl mx-auto">
                            <AdvancedAnalyticsPanel insights={insights} />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
