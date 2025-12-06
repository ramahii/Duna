import { useState } from 'react';

export default function SubtaskList({ taskId, darkMode, subtasks = [], onAddSubtask, onToggleSubtask, onDeleteSubtask }) {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      await onAddSubtask(taskId, newSubtaskTitle);
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  const completedCount = subtasks.filter(s => s.status === 'completed').length;
  const totalCount = subtasks.length;

  return (
    <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-white/30'}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
          📋 Subtasks {totalCount > 0 && `(${completedCount}/${totalCount})`}
        </h4>
        {totalCount > 0 && (
          <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {subtasks.map(subtask => (
          <div
            key={subtask.id}
            className={`flex items-center gap-3 p-2 rounded ${
              darkMode ? 'bg-slate-600/50' : 'bg-white/40'
            }`}
          >
            <input
              type="checkbox"
              checked={subtask.status === 'completed'}
              onChange={() => onToggleSubtask(taskId, subtask.id)}
              className="w-4 h-4 cursor-pointer"
            />
            <span
              className={`flex-1 ${
                subtask.status === 'completed'
                  ? `line-through ${darkMode ? 'text-slate-500' : 'text-gray-400'}`
                  : darkMode ? 'text-slate-200' : 'text-gray-800'
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => onDeleteSubtask(taskId, subtask.id)}
              className={`px-2 py-1 rounded text-xs transition ${
                darkMode ? 'hover:bg-red-600/50 text-red-300' : 'hover:bg-red-200 text-red-700'
              }`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {showAddSubtask ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            placeholder="Add subtask..."
            className={`flex-1 px-2 py-1 rounded text-sm ${
              darkMode
                ? 'bg-slate-600/50 border border-slate-500 text-slate-100'
                : 'bg-white/40 border border-white/50 text-gray-800'
            } focus:outline-none`}
            autoFocus
          />
          <button
            onClick={handleAddSubtask}
            className={`px-3 py-1 rounded text-sm font-medium text-white ${
              darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Add
          </button>
          <button
            onClick={() => setShowAddSubtask(false)}
            className={`px-3 py-1 rounded text-sm ${
              darkMode ? 'bg-slate-600 hover:bg-slate-700' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSubtask(true)}
          className={`w-full py-2 rounded text-sm font-medium transition ${
            darkMode
              ? 'bg-slate-600/50 hover:bg-slate-600 text-slate-300'
              : 'bg-white/40 hover:bg-white/60 text-gray-700'
          }`}
        >
          + Add Subtask
        </button>
      )}
    </div>
  );
}
