import { lazy, Suspense, useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DeferredMount from '../components/ui/DeferredMount';

const RetentionLineChart = lazy(() => import('../components/charts/AnalyticsCharts').then((m) => ({ default: m.RetentionLineChart })));
const StudyHoursBarChart = lazy(() => import('../components/charts/AnalyticsCharts').then((m) => ({ default: m.StudyHoursBarChart })));
const GrowthAreaChart = lazy(() => import('../components/charts/AnalyticsCharts').then((m) => ({ default: m.GrowthAreaChart })));

const chartFallback = <div className="skeleton" style={{ height: 260 }} aria-hidden="true" />;

const MOCK_DATA = {
  retentionCurve: [
    { date: 'Day 1', retention: 100 },
    { date: 'Day 2', retention: 85 },
    { date: 'Day 3', retention: 70 },
    { date: 'Day 4', retention: 95 },
    { date: 'Day 5', retention: 82 },
    { date: 'Day 6', retention: 75 },
    { date: 'Day 7', retention: 98 },
  ],
  studyHours: [
    { date: 'Mon', hours: 2.5 },
    { date: 'Tue', hours: 3.2 },
    { date: 'Wed', hours: 1.8 },
    { date: 'Thu', hours: 4.5 },
    { date: 'Fri', hours: 2.0 },
    { date: 'Sat', hours: 5.5 },
    { date: 'Sun', hours: 4.0 },
  ],
  skillGrowth: [
    { month: 'Jan', score: 20 },
    { month: 'Feb', score: 35 },
    { month: 'Mar', score: 45 },
    { month: 'Apr', score: 60 },
    { month: 'May', score: 75 },
    { month: 'Jun', score: 85 },
  ],
};

const Analytics = () => {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [retentionRes, dashboardRes] = await Promise.all([
          analyticsAPI.getRetention(),
          analyticsAPI.getDashboard(),
        ]);

        if (cancelled) return;

        const retentionCurve = retentionRes.data.data?.length
          ? retentionRes.data.data.map((point, index) => ({
              date: `Day ${index + 1}`,
              retention: point.retention ?? 0,
            }))
          : MOCK_DATA.retentionCurve;

        const overview = dashboardRes.data.data?.overview;
        const skillGrowth = overview
          ? MOCK_DATA.skillGrowth.map((item, index) => ({
              ...item,
              score: Math.min(100, (overview.careerReadinessScore || 0) + index * 8),
            }))
          : MOCK_DATA.skillGrowth;

        setData({ retentionCurve, studyHours: MOCK_DATA.studyHours, skillGrowth });
      } catch {
        if (!cancelled) setData(MOCK_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const run = () => load();
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 1000 });
      return () => { cancelled = true; cancelIdleCallback(id); };
    }
    const t = setTimeout(run, 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Advanced Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 2 }}>Deep dive into your learning patterns and growth</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
        <div className="chart-container page-enter">
          <div className="section-header">
            <div>
              <h3 className="section-title">Memory Forgetting Curve</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Average retention rate across topics over time</p>
            </div>
          </div>
          <DeferredMount fallback={chartFallback} minHeight={260}>
            <Suspense fallback={chartFallback}>
              <RetentionLineChart data={data.retentionCurve} />
            </Suspense>
          </DeferredMount>
        </div>

        <div className="chart-container page-enter">
          <div className="section-header">
            <div>
              <h3 className="section-title">Weekly Study Hours</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Consistency is key to mastery</p>
            </div>
          </div>
          <DeferredMount fallback={chartFallback} minHeight={260}>
            <Suspense fallback={chartFallback}>
              <StudyHoursBarChart data={data.studyHours} />
            </Suspense>
          </DeferredMount>
        </div>

        <div className="chart-container page-enter" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <div>
              <h3 className="section-title">Career Readiness Growth</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your overall skill progression over the last 6 months</p>
            </div>
          </div>
          <DeferredMount fallback={chartFallback} minHeight={260}>
            <Suspense fallback={chartFallback}>
              <GrowthAreaChart data={data.skillGrowth} />
            </Suspense>
          </DeferredMount>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
