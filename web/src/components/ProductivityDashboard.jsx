import { useState, useEffect } from 'react';

export default function ProductivityDashboard({ darkMode }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/productivity/me/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className={darkMode ? 'text-slate-300' : 'text-gray-700'}>Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 ${
          darkMode 
            ? 'bg-slate-800/20 border border-slate-700/30' 
            : 'bg-white/35 border border-white/60'
        }`}
      >
        <div className={`text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-300' 
            : 'text-amber-700'
        }`}>
          {stats.total_tasks_completed || 0}
        </div>
        <div className={`text-xs mt-1 transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-200/70' 
            : 'text-amber-600/70'
        }`}>
          Tasks Completed
        </div>
      </div>

      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 ${
          darkMode 
            ? 'bg-slate-800/20 border border-slate-700/30' 
            : 'bg-white/35 border border-white/60'
        }`}
      >
        <div className={`text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-300' 
            : 'text-amber-700'
        }`}>
          {Math.floor((stats.total_study_minutes || 0) / 60)}h
        </div>
        <div className={`text-xs mt-1 transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-200/70' 
            : 'text-amber-600/70'
        }`}>
          Study Hours
        </div>
      </div>

      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 ${
          darkMode 
            ? 'bg-slate-800/20 border border-slate-700/30' 
            : 'bg-white/35 border border-white/60'
        }`}
      >
        <div className={`text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-300' 
            : 'text-amber-700'
        }`}>
          {stats.current_streak || 0}
        </div>
        <div className={`text-xs mt-1 transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-200/70' 
            : 'text-amber-600/70'
        }`}>
          Day Streak 🔥
        </div>
      </div>

      <div
        className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-300 transform hover:scale-105 ${
          darkMode 
            ? 'bg-slate-800/20 border border-slate-700/30' 
            : 'bg-white/35 border border-white/60'
        }`}
      >
        <div className={`text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-300' 
            : 'text-amber-700'
        }`}>
          {stats.last_activity_date ? '✓' : '○'}
        </div>
        <div className={`text-xs mt-1 transition-colors duration-300 ${
          darkMode 
            ? 'text-amber-200/70' 
            : 'text-amber-600/70'
        }`}>
          Active Today
        </div>
      </div>
    </div>
  );
}
