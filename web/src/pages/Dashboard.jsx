import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';

export default function Dashboard({ darkMode, setDarkMode }) {
  const { logout } = useAuth();
  const { tasks, loading, createTask, markComplete, markPending, deleteTask } = useTasks();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    deadline: '',
  });

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
      });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Apply filters
  let filteredTasks = tasks.filter(t => 
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (priorityFilter === 'all' || t.priority === priorityFilter)
  );

  // Apply sorting
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const totalTasks = tasks.length;
  const totalPending = tasks.filter(t => t.status === 'pending').length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className={darkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-100 min-h-screen'}>
      {/* Header */}
      <header className={darkMode ? 'bg-gray-800 shadow' : 'bg-white shadow'}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Duna</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded ${darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-white'}`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={() => navigate('/stats')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              📊 Stats
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={darkMode ? 'bg-gray-800 rounded-lg shadow p-6' : 'bg-white rounded-lg shadow p-6'}>
            <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Total Tasks</p>
            <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
          </div>
          <div className={darkMode ? 'bg-gray-800 rounded-lg shadow p-6' : 'bg-white rounded-lg shadow p-6'}>
            <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{totalPending}</p>
          </div>
          <div className={darkMode ? 'bg-gray-800 rounded-lg shadow p-6' : 'bg-white rounded-lg shadow p-6'}>
            <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Completed</p>
            <p className="text-3xl font-bold text-green-600">{totalCompleted}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        </div>

        {/* Filters and Sort */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              <option value="created">Date Created</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              {showForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <div className={darkMode ? 'bg-gray-800 rounded-lg shadow p-6 mb-6' : 'bg-white rounded-lg shadow p-6 mb-6'}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Task description"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Deadline (optional)</label>
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
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No tasks yet. Create one!</p>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map(task => (
              <div key={task.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-yellow-500`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>{task.description}</p>
                    {task.deadline && (
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-xs mt-2`}>
                        📅 Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-xs font-medium">
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markComplete(task.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mt-8 mb-4`}>Completed</h2>
                {completedTasks.map(task => (
                  <div key={task.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 border-l-4 border-green-500 opacity-75`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-through`}>{task.title}</h3>
                        {task.deadline && (
                          <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-xs mt-2`}>
                            📅 Due: {new Date(task.deadline).toLocaleDateString()}
                          </p>
                        )}
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-medium mt-2 inline-block">
                          Completed
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => markPending(task.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Undo
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
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