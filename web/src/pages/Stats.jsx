import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import ProductivityDashboard from '../components/ProductivityDashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Stats({ darkMode }) {
  const navigate = useNavigate();
  const { tasks } = useTasks();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  // Get last 7 days of completed tasks
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const count = tasks.filter(t => 
      t.status === 'completed' && 
      t.updated_at.split('T')[0] === dateStr
    ).length;
    last7Days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count,
    });
  }

  // Priority distribution
  const priorityData = [
    { name: 'High', value: highPriority, color: '#ef4444' },
    { name: 'Medium', value: mediumPriority, color: '#eab308' },
    { name: 'Low', value: lowPriority, color: '#22c55e' },
  ];

  // Status distribution
  const statusData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'Pending', value: pendingTasks, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-amber-50 transition-colors duration-300">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/40 border-b border-amber-100/40 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-amber-900 transition-colors duration-300">
              📊 Statistics
            </h1>
            <p className="text-amber-700/70 text-sm mt-1">Track your progress</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Productivity Dashboard Component */}
        <div className="mb-8">
          <ProductivityDashboard darkMode={darkMode} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 hover:bg-white/45 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <p className="text-amber-700 text-sm font-medium">Total Tasks</p>
            <p className="text-4xl font-bold text-amber-800 mt-2">{totalTasks}</p>
            <div className="h-2 bg-amber-400 rounded-full mt-4 w-full opacity-60"></div>
          </div>
          <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 hover:bg-white/45 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <p className="text-emerald-700 text-sm font-medium">Completed</p>
            <p className="text-4xl font-bold text-emerald-700 mt-2">{completedTasks}</p>
            <div className="h-2 bg-emerald-400 rounded-full mt-4 w-full opacity-60"></div>
          </div>
          <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 hover:bg-white/45 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <p className="text-orange-600 text-sm font-medium">Pending</p>
            <p className="text-4xl font-bold text-orange-700 mt-2">{pendingTasks}</p>
            <div className="h-2 bg-orange-400 rounded-full mt-4 w-full opacity-60"></div>
          </div>
          <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 hover:bg-white/45 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            <p className="text-amber-600 text-sm font-medium">Completion Rate</p>
            <p className="text-4xl font-bold text-amber-700 mt-2">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
            <div className="h-2 bg-amber-300 rounded-full mt-4 w-full opacity-60"></div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart - Last 7 Days */}
        <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-amber-900 mb-6">📈 Completed Tasks (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Priority Distribution */}
        <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-amber-900 mb-6">🎯 Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Status Distribution */}
        <div className="backdrop-blur-xl bg-white/35 border border-white/60 rounded-3xl shadow-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-bold text-amber-900 mb-6">✨ Task Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      </main>
    </div>
  );
}