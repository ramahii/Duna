import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useEffect, useState } from 'react';

export default function Analytics({ darkMode }) {
  const navigate = useNavigate();
  const { tasks, getProductivityStats } = useTasks();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getProductivityStats();
        setStats(data);
      } catch {
        console.log('Unable to fetch productivity stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [getProductivityStats]);

  // Generate last 30 days completion data
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = tasks.filter(t => 
      t.status === 'completed' && 
      t.updated_at?.split('T')[0] === dateStr
    ).length;
    last30Days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count,
    });
  }

  // Calculate trends
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityCompletionData = [
    { 
      name: 'High Priority', 
      completed: tasks.filter(t => t.priority === 'high' && t.status === 'completed').length,
      pending: tasks.filter(t => t.priority === 'high' && t.status === 'pending').length
    },
    { 
      name: 'Medium Priority', 
      completed: tasks.filter(t => t.priority === 'medium' && t.status === 'completed').length,
      pending: tasks.filter(t => t.priority === 'medium' && t.status === 'pending').length
    },
    { 
      name: 'Low Priority', 
      completed: tasks.filter(t => t.priority === 'low' && t.status === 'completed').length,
      pending: tasks.filter(t => t.priority === 'low' && t.status === 'pending').length
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-amber-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-xl border-b transition-colors duration-300 sticky top-0 z-50 ${
        darkMode 
          ? 'bg-slate-800/40 border-slate-700/30' 
          : 'bg-white/40 border-amber-100/40'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className={`text-4xl font-bold transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-900'
            }`}>
              📊 Analytics
            </h1>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200/60' 
                : 'text-amber-700/70'
            }`}>
              Detailed productivity insights
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? 'bg-amber-600/80 hover:bg-amber-500/90 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl ${
            darkMode
              ? 'bg-slate-800/20 border border-slate-700/30'
              : 'bg-white/35 border border-white/60'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-700'
            }`}>
              Completion Rate
            </p>
            <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200' 
                : 'text-amber-800'
            }`}>
              {completionRate}%
            </p>
            <div className={`h-2 rounded-full mt-4 w-full transition-colors duration-300 ${
              darkMode 
                ? 'bg-amber-500/40' 
                : 'bg-amber-300/60'
            }`}></div>
          </div>

          <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl ${
            darkMode
              ? 'bg-slate-800/20 border border-slate-700/30'
              : 'bg-white/35 border border-white/60'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-700'
            }`}>
              Total Completed
            </p>
            <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200' 
                : 'text-amber-800'
            }`}>
              {completedTasks}
            </p>
            <div className={`h-2 rounded-full mt-4 w-full transition-colors duration-300 ${
              darkMode 
                ? 'bg-amber-500/40' 
                : 'bg-amber-300/60'
            }`}></div>
          </div>

          <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl ${
            darkMode
              ? 'bg-slate-800/20 border border-slate-700/30'
              : 'bg-white/35 border border-white/60'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-700'
            }`}>
              Total Tasks
            </p>
            <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200' 
                : 'text-amber-800'
            }`}>
              {totalTasks}
            </p>
            <div className={`h-2 rounded-full mt-4 w-full transition-colors duration-300 ${
              darkMode 
                ? 'bg-amber-500/40' 
                : 'bg-amber-300/60'
            }`}></div>
          </div>

          <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl ${
            darkMode
              ? 'bg-slate-800/20 border border-slate-700/30'
              : 'bg-white/35 border border-white/60'
          }`}>
            <p className={`text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-700'
            }`}>
              Pending
            </p>
            <p className={`text-4xl font-bold mt-2 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200' 
                : 'text-amber-800'
            }`}>
              {totalTasks - completedTasks}
            </p>
            <div className={`h-2 rounded-full mt-4 w-full transition-colors duration-300 ${
              darkMode 
                ? 'bg-amber-500/40' 
                : 'bg-amber-300/60'
            }`}></div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 30-Day Trend */}
          <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-6 transition-colors duration-300 ${
            darkMode
              ? 'bg-slate-800/20 border border-slate-700/30'
              : 'bg-white/35 border border-white/60'
          }`}>
            <h2 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-900'
            }`}>
              📈 Completion Trend (30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e0e7ff'} />
                <XAxis dataKey="date" stroke={darkMode ? '#94a3b8' : '#666'} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                <Tooltip contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: `1px solid ${darkMode ? '#475569' : '#e0e7ff'}`,
                  borderRadius: '8px'
                }} />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 ${
            darkMode
              ? 'bg-slate-800/50 border border-slate-700/50'
              : 'bg-white/40 border border-white/60'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
              🎯 Task Priority Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e0e7ff'} />
                <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#666'} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#666'} />
                <Tooltip contentStyle={{
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  border: `1px solid ${darkMode ? '#475569' : '#e0e7ff'}`,
                  borderRadius: '8px'
                }} />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Stats */}
        {stats && (
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-8 ${
            darkMode
              ? 'bg-slate-800/50 border border-slate-700/50'
              : 'bg-white/40 border border-white/60'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
              🚀 Productivity Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-white/30'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Study Hours
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {stats.study_hours || 0}h
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-white/30'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Current Streak
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {stats.current_streak || 0} days
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-white/30'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Active Today
                </p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.active_today ? '✓' : '○'}
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-8 text-center ${
            darkMode
              ? 'bg-slate-800/50 border border-slate-700/50'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Loading productivity metrics...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
