import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition transform animate-bounce ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`}>
      {message}
    </div>
  );
};

// Pomodoro Timer Component
const PomodoroTimer = ({ task, darkMode, onClose }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds]);

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
      <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-sm ${
        darkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-white/60'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
          🍅 Pomodoro Timer
        </h2>
        <p className={`text-center text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {task.title}
        </p>
        <div className={`text-6xl font-bold text-center mb-8 font-mono ${
          darkMode ? 'text-blue-300' : 'text-amber-600'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              isRunning
                ? darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                : darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={() => {
              setMinutes(25);
              setSeconds(0);
              setIsRunning(false);
            }}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            🔄 Reset
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({ darkMode, setDarkMode }) {
  const { logout } = useAuth();
  const { tasks, loading, createTask, markComplete, markPending, deleteTask } = useTasks();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [showPomodoro, setShowPomodoro] = useState(null);
  const [showTaskNotes, setShowTaskNotes] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [newNote, setNewNote] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    category: '',
    recurrence: 'none',
  });

  const categories = ['Math', 'Science', 'History', 'Literature', 'Languages', 'Programming', 'Other'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        deadline: '',
        category: '',
        recurrence: 'none',
      });
      setShowForm(false);
      setToast({ message: '✓ Task created successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: '✗ Failed to create task', type: 'error' });
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await markComplete(taskId);
      setToast({ message: '🎉 Task completed!', type: 'success' });
    } catch (err) {
      setToast({ message: '✗ Failed to complete task', type: 'error' });
    }
  };

  // Filter and sort tasks
  let filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || (t.category === categoryFilter);
    return matchesSearch && matchesPriority && matchesCategory;
  });

  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'status') {
      const statusOrder = { overdue: 0, today: 1, upcoming: 2 };
      return (statusOrder[a.status_label] || 3) - (statusOrder[b.status_label] || 3);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const totalTasks = tasks.length;
  const totalPending = tasks.filter(t => t.status === 'pending').length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalOverdue = tasks.filter(t => t.status === 'pending' && t.days_until_deadline < 0).length;

  const getStatusColor = (task) => {
    if (task.status === 'completed') return 'completed';
    if (!task.deadline) return 'upcoming';
    const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'overdue';
    if (daysLeft === 0) return 'today';
    return 'upcoming';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50'
    }`}>
      {/* Header with Glassmorphism */}
      <header className={`backdrop-blur-md border-b transition-all duration-300 sticky top-0 z-50 ${
        darkMode
          ? 'bg-slate-800/70 border-slate-700/50'
          : 'bg-white/70 border-amber-100/50'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r ${
              darkMode
                ? 'from-blue-400 to-cyan-300'
                : 'from-amber-700 to-orange-600'
            } bg-clip-text text-transparent`}>
              Duna
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300' : 'text-amber-600'}`}>
              Your Study Companion
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg backdrop-blur-md font-medium transition transform hover:scale-105 ${
                darkMode
                  ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300 hover:bg-blue-500/50'
                  : 'bg-white/40 hover:bg-white/60 border border-amber-200/50 text-amber-700'
              }`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={() => navigate('/stats')}
              className={`px-4 py-2 rounded-lg text-white font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
              }`}
            >
              📊 Stats
            </button>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-lg backdrop-blur-md font-medium transition transform hover:scale-105 ${
                darkMode
                  ? 'bg-red-500/30 border border-red-400/50 text-red-300 hover:bg-red-500/50'
                  : 'bg-red-500/20 hover:bg-red-500/30 border border-red-200/50 text-red-700'
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards with better styling */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-blue-500/20 border border-blue-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
              Total Tasks
            </p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
              {totalTasks}
            </p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-blue-400' : 'bg-amber-300'}`}></div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-orange-500/20 border border-orange-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
              Pending
            </p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
              {totalPending}
            </p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-orange-400' : 'bg-orange-300'}`}></div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
              Completed
            </p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
              {totalCompleted}
            </p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-green-400' : 'bg-green-300'}`}></div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search your tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
              darkMode
                ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 focus:bg-slate-700 placeholder-slate-400 text-slate-100'
                : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 focus:bg-white/60 placeholder-amber-600/50 text-gray-800'
            }`}
          />
        </div>

        {/* Filters and Controls */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                darkMode
                  ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                  : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                darkMode
                  ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                  : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
              }`}
            >
              <option value="created">📅 Date Created</option>
              <option value="deadline">⏰ Deadline</option>
              <option value="priority">⭐ Priority</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`w-full text-white px-6 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
              }`}
            >
              {showForm ? '✕ Cancel' : '+ Add Task'}
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 transition border ${
            darkMode
              ? 'bg-slate-800/50 border-slate-700/50'
              : 'bg-white/50 border border-white/60'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                    darkMode
                      ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100 placeholder-slate-400'
                      : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800 placeholder-amber-600/50'
                  }`}
                  placeholder="What do you need to do?"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                    darkMode
                      ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100 placeholder-slate-400'
                      : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800 placeholder-amber-600/50'
                  }`}
                  placeholder="Add details..."
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                        : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                    }`}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
                    Deadline
                  </label>
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value + 'T18:00:00');
                        setFormData({ ...formData, deadline: date.toISOString() });
                      } else {
                        setFormData({ ...formData, deadline: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                        : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                    darkMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  ✓ Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                    darkMode
                      ? 'bg-slate-700/60 hover:bg-slate-700/80 border border-slate-600/50 text-slate-300'
                      : 'backdrop-blur-md bg-gray-200/40 hover:bg-gray-300/40 border border-gray-300/50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <p className={`text-center py-12 text-lg ${darkMode ? 'text-blue-300' : 'text-amber-600'}`}>
            Loading your tasks...
          </p>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-400' : 'text-amber-600'}`}>
              No tasks yet. Let's get started! 🚀
            </p>
            <button
              onClick={() => setShowForm(true)}
              className={`text-white px-6 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
              }`}
            >
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <div
                key={task.id}
                className={`backdrop-blur-md border-l-4 rounded-xl shadow-lg p-5 hover:shadow-2xl transition transform hover:scale-[1.01] ${
                  darkMode
                    ? 'bg-slate-800/50 border-l-orange-400 border border-slate-700/50'
                    : 'bg-white/40 border-l-orange-500 border border-white/40'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    {task.deadline && (
                      <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-orange-300' : 'text-amber-700'}`}>
                        ⏰ Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        task.priority === 'high'
                          ? darkMode ? 'bg-red-500/30 text-red-300 border-red-400/50' : 'bg-red-200/50 text-red-800 border-red-300/50'
                          : task.priority === 'medium'
                          ? darkMode ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50' : 'bg-yellow-200/50 text-yellow-800 border-yellow-300/50'
                          : darkMode ? 'bg-green-500/30 text-green-300 border-green-400/50' : 'bg-green-200/50 text-green-800 border-green-300/50'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${
                        darkMode
                          ? 'bg-orange-500/30 text-orange-300 border-orange-400/50'
                          : 'bg-amber-100/50 text-amber-800 border-amber-200/50'
                      }`}>
                        PENDING
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => markComplete(task.id)}
                      className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
                        darkMode
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
                        darkMode
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold mt-8 mb-4 ${darkMode ? 'text-green-300' : 'text-amber-800'}`}>
                  ✨ Completed Tasks
                </h2>
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`backdrop-blur-md border-l-4 rounded-xl shadow-lg p-5 opacity-75 hover:opacity-100 transition transform hover:scale-[1.01] border-l-green-500 ${
                      darkMode
                        ? 'bg-slate-800/30 border border-slate-700/30'
                        : 'bg-white/30 border border-white/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold line-through ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                          {task.title}
                        </h3>
                        {task.deadline && (
                          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-amber-600/60'}`}>
                            ⏰ Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}
                        <span className={`px-3 py-1 rounded text-xs font-medium border mt-2 inline-block ${
                          darkMode
                            ? 'bg-green-500/30 text-green-300 border-green-400/50'
                            : 'bg-green-200/60 text-green-800 border-green-300/50'
                        }`}>
                          COMPLETED
                        </span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => markPending(task.id)}
                          className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
                            darkMode
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          ↩ Undo
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
                            darkMode
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-red-500 hover:bg-red-600'
                          }`}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}