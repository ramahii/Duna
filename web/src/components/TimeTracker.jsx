import { useState } from 'react';

export default function TimeTracker({ darkMode, timeLogs = [], onAddTimeLog }) {
  const [showAddLog, setShowAddLog] = useState(false);
  const [duration, setDuration] = useState('');
  const [estimated, setEstimated] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddLog = async () => {
    if (duration && onAddTimeLog) {
      try {
        await onAddTimeLog({
          duration_minutes: parseInt(duration),
          estimated_minutes: estimated ? parseInt(estimated) : null,
          notes,
        });
        setDuration('');
        setEstimated('');
        setNotes('');
        setShowAddLog(false);
      } catch (err) {
        console.error('Failed to log time:', err);
      }
    }
  };

  const totalSpent = timeLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
  const totalEstimated = timeLogs.reduce((sum, log) => sum + (log.estimated_minutes || 0), 0);

  return (
    <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-white/30'}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          ⏱ Time Tracking
        </h4>
        <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {totalSpent}m{totalEstimated ? ` / ${totalEstimated}m` : ''}
        </div>
      </div>

      <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
        {timeLogs.length === 0 ? (
          <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
            No time logs yet
          </p>
        ) : (
          timeLogs.map(log => (
            <div key={log.id} className={`p-2 rounded text-sm ${darkMode ? 'bg-slate-600/50' : 'bg-white/40'}`}>
              <div className="flex justify-between">
                <span className={darkMode ? 'text-slate-200' : 'text-gray-800'}>
                  {log.duration_minutes}m{log.estimated_minutes ? ` / ${log.estimated_minutes}m` : ''}
                </span>
                <span className={darkMode ? 'text-slate-500' : 'text-gray-500'}>
                  {new Date(log.logged_date).toLocaleDateString()}
                </span>
              </div>
              {log.notes && (
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {log.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {showAddLog ? (
        <div className="space-y-2">
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Time spent (minutes)"
            className={`w-full px-2 py-1 rounded text-sm ${
              darkMode
                ? 'bg-slate-600/50 border border-slate-500 text-slate-100'
                : 'bg-white/40 border border-white/50 text-gray-800'
            } focus:outline-none`}
          />
          <input
            type="number"
            min="1"
            value={estimated}
            onChange={(e) => setEstimated(e.target.value)}
            placeholder="Estimated time (minutes, optional)"
            className={`w-full px-2 py-1 rounded text-sm ${
              darkMode
                ? 'bg-slate-600/50 border border-slate-500 text-slate-100'
                : 'bg-white/40 border border-white/50 text-gray-800'
            } focus:outline-none`}
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className={`w-full px-2 py-1 rounded text-sm ${
              darkMode
                ? 'bg-slate-600/50 border border-slate-500 text-slate-100'
                : 'bg-white/40 border border-white/50 text-gray-800'
            } focus:outline-none`}
            rows="2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddLog}
              className={`flex-1 py-1 rounded text-sm font-medium text-white ${
                darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Log
            </button>
            <button
              onClick={() => setShowAddLog(false)}
              className={`flex-1 py-1 rounded text-sm ${
                darkMode ? 'bg-slate-600 hover:bg-slate-700' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddLog(true)}
          className={`w-full py-2 rounded text-sm font-medium transition ${
            darkMode
              ? 'bg-slate-600/50 hover:bg-slate-600 text-slate-300'
              : 'bg-white/40 hover:bg-white/60 text-gray-700'
          }`}
        >
          + Log Time
        </button>
      )}
    </div>
  );
}
