import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useState, useEffect } from 'react';

export default function Settings({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { getGoals, createGoal } = useTasks();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      enableNotifications: true,
      enableSoundAlerts: true,
      enableFocusMode: false,
      autoSave: false
    };
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goalsData = await getGoals();
        setGoals(goalsData);
      } catch {
        setGoals([]);
      }
    };
    fetchGoals();
  }, [getGoals]);

  const handlePreferenceChange = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (newGoal.trim()) {
      try {
        await createGoal({
          title: newGoal,
          target_value: 10,
          current_value: 0,
          unit: 'tasks'
        });
        setNewGoal('');
        setShowGoalForm(false);
        const updatedGoals = await getGoals();
        setGoals(updatedGoals);
      } catch {
        console.error('Failed to create goal');
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-amber-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300 ${
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
              ⚙️ Settings
            </h1>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200/60' 
                : 'text-amber-700/70'
            }`}>
              Customize your experience
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Appearance Section */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-8 mb-8 transition-colors duration-300 ${
          darkMode
            ? 'bg-slate-800/20 border border-slate-700/30'
            : 'bg-white/35 border border-white/60'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            darkMode 
              ? 'text-amber-300' 
              : 'text-amber-900'
          }`}>
            🎨 Appearance
          </h2>

          {/* Dark Mode Toggle */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className={`text-lg font-medium transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-100' 
                  : 'text-amber-900'
              }`}>
                Dark Mode
              </label>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
                  darkMode 
                    ? 'bg-amber-600/60' 
                    : 'bg-amber-300/50'
                }`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ${
                  darkMode 
                    ? 'translate-x-7' 
                    : 'translate-x-1'
                }`} />
              </button>
            </div>
            <p className={`text-sm transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200/50' 
                : 'text-amber-700/70'
            }`}>
              Toggle between light and dark color schemes
            </p>
          </div>
        </div>

        {/* Goals Section */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-8 mb-8 transition-colors duration-300 ${
          darkMode
            ? 'bg-slate-800/20 border border-slate-700/30'
            : 'bg-white/35 border border-white/60'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-300' 
                : 'text-amber-900'
            }`}>
              🎯 Goals
            </h2>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                darkMode
                  ? 'bg-amber-600/60 hover:bg-amber-500/70 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {showGoalForm ? '✕ Cancel' : '+ Add Goal'}
            </button>
          </div>

          {/* Add Goal Form */}
          {showGoalForm && (
            <form onSubmit={handleAddGoal} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Enter a new goal..."
                  className={`flex-1 px-4 py-2 rounded-xl outline-none transition-all duration-300 backdrop-blur-sm ${
                    darkMode
                      ? 'bg-slate-700/30 border border-slate-600/40 text-white placeholder-amber-200/40 focus:border-amber-400/60'
                      : 'bg-white/50 border border-white/60 text-amber-900 placeholder-amber-600/40 focus:border-amber-400'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    darkMode
                      ? 'bg-amber-600/60 hover:bg-amber-500/70 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl backdrop-blur-sm transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-slate-700/20 border border-slate-600/20' 
                      : 'bg-white/40 border border-white/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold transition-colors duration-300 ${
                      darkMode 
                        ? 'text-amber-100' 
                        : 'text-amber-900'
                    }`}>
                      {goal.title}
                    </h3>
                    <span className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors duration-300 ${
                      darkMode
                        ? 'bg-amber-900/40 text-amber-200'
                        : 'bg-amber-100/60 text-amber-800'
                    }`}>
                      {goal.current_value || 0}/{goal.target_value} {goal.unit}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-slate-600/30' 
                      : 'bg-white/50'
                  }`}>
                    <div
                      className={`h-full transition-all duration-500 ${
                        darkMode
                          ? 'bg-amber-500/80'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${((goal.current_value || 0) / goal.target_value) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-center py-8 transition-colors duration-300 ${
              darkMode 
                ? 'text-amber-200/50' 
                : 'text-amber-700/60'
            }`}>
              No goals yet. Create one to get started! 🚀
            </p>
          )}
        </div>

        {/* Preferences Section */}
        <div className={`backdrop-blur-xl rounded-3xl shadow-lg p-8 transition-colors duration-300 ${
          darkMode
            ? 'bg-slate-800/20 border border-slate-700/30'
            : 'bg-white/35 border border-white/60'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            darkMode 
              ? 'text-amber-300' 
              : 'text-amber-900'
          }`}>
            ⚡ Preferences
          </h2>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl backdrop-blur-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-700/20 border border-slate-600/20' 
                : 'bg-white/40 border border-white/40'
            }`}>
              <label className={`flex items-center gap-3 cursor-pointer transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-100' 
                  : 'text-amber-900'
              }`}>
                <input 
                  type="checkbox" 
                  checked={preferences.enableNotifications}
                  onChange={() => handlePreferenceChange('enableNotifications')}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>Enable notifications</span>
              </label>
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-200/50' 
                  : 'text-amber-700/70'
              }`}>
                Receive reminders for upcoming tasks
              </p>
            </div>

            <div className={`p-4 rounded-xl backdrop-blur-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-700/20 border border-slate-600/20' 
                : 'bg-white/40 border border-white/40'
            }`}>
              <label className={`flex items-center gap-3 cursor-pointer transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-100' 
                  : 'text-amber-900'
              }`}>
                <input 
                  type="checkbox" 
                  checked={preferences.enableSoundAlerts}
                  onChange={() => handlePreferenceChange('enableSoundAlerts')}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>Enable sound alerts</span>
              </label>
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-200/50' 
                  : 'text-amber-700/70'
              }`}>
                Play sounds when tasks are completed
              </p>
            </div>

            <div className={`p-4 rounded-xl backdrop-blur-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-700/20 border border-slate-600/20' 
                : 'bg-white/40 border border-white/40'
            }`}>
              <label className={`flex items-center gap-3 cursor-pointer transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-100' 
                  : 'text-amber-900'
              }`}>
                <input 
                  type="checkbox" 
                  checked={preferences.enableFocusMode}
                  onChange={() => handlePreferenceChange('enableFocusMode')}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>Enable focus mode</span>
              </label>
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-200/50' 
                  : 'text-amber-700/70'
              }`}>
                Hide distracting UI elements during work sessions
              </p>
            </div>

            <div className={`p-4 rounded-xl backdrop-blur-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-slate-700/20 border border-slate-600/20' 
                : 'bg-white/40 border border-white/40'
            }`}>
              <label className={`flex items-center gap-3 cursor-pointer transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-100' 
                  : 'text-amber-900'
              }`}>
                <input 
                  type="checkbox" 
                  checked={preferences.autoSave}
                  onChange={() => handlePreferenceChange('autoSave')}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span>Auto-save changes</span>
              </label>
              <p className={`text-sm mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'text-amber-200/50' 
                  : 'text-amber-700/70'
              }`}>
                Automatically save your work as you type
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
