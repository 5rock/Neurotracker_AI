const prefetched = new Set();

const routeLoaders = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/memory-tracker': () => import('../pages/MemoryTracker'),
  '/weak-topics': () => import('../pages/WeakTopicAnalyzer'),
  '/revision-scheduler': () => import('../pages/RevisionScheduler'),
  '/skill-gap': () => import('../pages/SkillGapPredictor'),
  '/career-roadmap': () => import('../pages/CareerRoadmap'),
  '/ai-mentor': () => import('../pages/AIMentor'),
  '/analytics': () => import('../pages/Analytics'),
  '/profile': () => import('../pages/Profile'),
  '/leaderboard': () => import('../pages/Leaderboard'),
};

export const prefetchRoute = (path) => {
  const loader = routeLoaders[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);

  const run = () => loader().catch(() => prefetched.delete(path));
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 150);
  }
};
