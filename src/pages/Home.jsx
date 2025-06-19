import { useEffect } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import '../styles/dashboard.css';

export default function Home() {
  const { setTitle } = useLayout();

  useEffect(() => {
    setTitle('Planning & Development Economics Indicators');
    return () => {
      setTitle('Planning & Development Economics Indicators');
    };
  }, [setTitle]);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome to your Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="card-title">🗂 Department Activity</h2>
          <p className="card-text">Visualize performance and workload by department.</p>
        </div>
        <div className="card">
          <h2 className="card-title">📈 Summary Metrics</h2>
          <p className="card-text">View high-level KPIs, totals, and trends across projects.</p>
        </div>
      </div>
    </div>
  )
}
