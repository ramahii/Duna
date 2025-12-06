import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import SubtaskList from '../components/SubtaskList';
import TimeTracker from '../components/TimeTracker';
import ProductivityDashboard from '../components/ProductivityDashboard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
const PomodoroTimer = ({ task, darkMode, onClose, onTimerEnd }) => {
  const [inputMinutes, setInputMinutes] = useState('25');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  useEffect(() => {
    let interval;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimerEnd) onTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, onTimerEnd]);

  const handleSetDuration = () => {
    const newMinutes = Math.max(1, Math.min(120, parseInt(inputMinutes) || 25));
    setInputMinutes(String(newMinutes));
    const newSeconds = newMinutes * 60;
    setTotalSeconds(newSeconds);
    setRemainingSeconds(newSeconds);
    setIsRunning(false);
  };

  const handleStart = () => {
    if (!isRunning && remainingSeconds > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  // Minimized floating timer
  if (isMinimized) {
    return (
      <div 
        className={`fixed bottom-6 right-6 backdrop-blur-md rounded-xl shadow-2xl p-4 z-40 cursor-pointer transition hover:scale-105 ${
          darkMode ? 'bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80' : 'bg-white/80 border border-white/60 hover:bg-white/90'
        }`} 
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-mono font-bold ${darkMode ? 'text-blue-300' : 'text-amber-600'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isRunning ? handlePause() : handleStart();
            }}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              isRunning
                ? darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                : darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50`}>
      <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-sm ${
        darkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-white/60'
      }`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
          🍅 Pomodoro Timer
        </h2>
        <p className={`text-center text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {task?.title}
        </p>

        {/* Duration Input */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            Duration (minutes)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="120"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              disabled={isRunning}
              className={`flex-1 px-4 py-2 rounded-lg border transition ${
                darkMode
                  ? 'bg-slate-700/50 border-slate-600/50 text-slate-100'
                  : 'bg-white border-gray-300 text-gray-800'
              } disabled:opacity-50`}
            />
            <button
              onClick={handleSetDuration}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isRunning
                  ? darkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-300 text-gray-500'
                  : darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Set
            </button>
          </div>
        </div>

        <div className={`text-6xl font-bold text-center mb-8 font-mono ${
          darkMode ? 'text-blue-300' : 'text-amber-600'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleStart}
            disabled={isRunning || remainingSeconds === 0}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              isRunning || remainingSeconds === 0
                ? darkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-300 text-gray-500'
                : darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ▶ Start
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              !isRunning
                ? darkMode ? 'bg-slate-700/50 text-slate-500' : 'bg-gray-300 text-gray-500'
                : darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ⏸ Pause
          </button>
          <button
            onClick={handleReset}
            className={`flex-1 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }`}
          >
            🔄 Reset
          </button>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className={`w-full py-3 rounded-lg font-medium transition transform hover:scale-105 ${
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          }`}
        >
          ↙ Minimize
        </button>
      </div>
    </div>
  );
};

// Sortable Task Item Component (for drag and drop)
const SortableTaskItem = ({ 
  task, 
  darkMode, 
  onComplete, 
  onDelete, 
  onPomodoro, 
  onNotes, 
  getDeadlineStatus,
  logTime,
  getTimeLogs,
  addSubtask,
  toggleSubtask,
  deleteSubtask
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [expandedFeature, setExpandedFeature] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deadlineInfo = getDeadlineStatus(task.deadline);

  const handleToggleFeature = async (feature) => {
    if (expandedFeature === feature) {
      setExpandedFeature(null);
    } else {
      setExpandedFeature(feature);
      if (feature === 'time' && timeLogs.length === 0) {
        try {
          const logs = await getTimeLogs(task.id);
          setTimeLogs(logs);
        } catch {
          console.log('No time logs yet');
        }
      }
    }
  };

  const handleAddTimeLog = async (logData) => {
    try {
      await logTime(task.id, logData);
      const logs = await getTimeLogs(task.id);
      setTimeLogs(logs);
    } catch {
      console.error('Failed to add time log');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`backdrop-blur-md border-l-4 rounded-xl shadow-lg p-5 hover:shadow-2xl transition transform ${
        isDragging ? 'scale-95 opacity-50' : 'hover:scale-[1.01]'
      } ${
        darkMode
          ? 'bg-slate-800/50 border-l-orange-400 border border-slate-700/50'
          : 'bg-white/40 border-l-orange-500 border border-white/40'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className={`shrink-0 cursor-grab active:cursor-grabbing px-2 py-2 rounded transition ${
            darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'
          }`}
          title="Drag to reorder"
        >
          <span className={`text-xl ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>≡</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`px-3 py-1 rounded text-xs font-medium border ${
              task.priority === 'high'
                ? darkMode ? 'bg-red-500/30 text-red-300 border-red-400/50' : 'bg-red-200/50 text-red-800 border-red-300/50'
                : task.priority === 'medium'
                ? darkMode ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50' : 'bg-yellow-200/50 text-yellow-800 border-yellow-300/50'
                : darkMode ? 'bg-green-500/30 text-green-300 border-green-400/50' : 'bg-green-200/50 text-green-800 border-green-300/50'
            }`}>
              {task.priority.toUpperCase()}
            </span>
            {task.category && (
              <span className={`px-3 py-1 rounded text-xs font-medium border ${
                darkMode
                  ? 'bg-blue-500/30 text-blue-300 border-blue-400/50'
                  : 'bg-blue-100/50 text-blue-800 border-blue-300/50'
              }`}>
                📚 {task.category}
              </span>
            )}
            <span className={`px-3 py-1 rounded text-xs font-medium border ${deadlineInfo.color}`}>
              {deadlineInfo.label}
            </span>
            {task.recurrence !== 'none' && (
              <span className={`px-3 py-1 rounded text-xs font-medium border ${
                darkMode
                  ? 'bg-purple-500/30 text-purple-300 border-purple-400/50'
                  : 'bg-purple-100/50 text-purple-800 border-purple-300/50'
              }`}>
                🔁 {task.recurrence}
              </span>
            )}
          </div>

          {/* Expandable Feature Sections */}
          {expandedFeature === 'subtasks' && (
            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <SubtaskList 
                taskId={task.id}
                darkMode={darkMode}
                subtasks={task.subtasks || []}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
              />
            </div>
          )}

          {expandedFeature === 'time' && (
            <div className="mt-4 pt-4 border-t border-slate-700/30">
              <TimeTracker 
                taskId={task.id}
                darkMode={darkMode}
                timeLogs={timeLogs}
                onAddTimeLog={handleAddTimeLog}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <button
            onClick={() => handleToggleFeature('subtasks')}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
              expandedFeature === 'subtasks'
                ? darkMode ? 'bg-indigo-700' : 'bg-indigo-600'
                : darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
            title="Subtasks"
          >
            ☑
          </button>
          <button
            onClick={() => handleToggleFeature('time')}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
              expandedFeature === 'time'
                ? darkMode ? 'bg-cyan-700' : 'bg-cyan-600'
                : darkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
            title="Time Tracking"
          >
            ⏱
          </button>
          <button
            onClick={() => onPomodoro(task)}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
            title="Start Pomodoro Timer"
          >
            🍅
          </button>
          <button
            onClick={() => onNotes(task)}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            title="Add Notes"
          >
            📝
          </button>
          <button
            onClick={() => onComplete(task.id)}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
              darkMode
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            ✓ Complete
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
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
  );
};

// Task Notes Component
const TaskNotesModal = ({ task, darkMode, onClose, onAddNote, getNotes, deleteNote }) => {
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const fetchedNotes = await getNotes(task.id);
        setNotes(fetchedNotes);
      } catch {
        setNotes([]);
      }
      setLoading(false);
    };
    if (task?.id) fetchNotes();
  }, [task, getNotes]);

  const handleAddNote = async () => {
    if (noteContent.trim()) {
      try {
        const newNote = await onAddNote(task.id, noteContent);
        setNotes([...notes, newNote]);
        setNoteContent('');
      } catch {
        // Error handled by parent
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(task.id, noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
      <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto ${
        darkMode ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-white/60'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-slate-100' : 'text-gray-800'}`}>
          📝 {task.title}
        </h2>
        
        {/* Add Note Section */}
        <div className="mb-6 pb-6 border-b" style={darkMode ? {borderColor: 'rgba(113, 128, 150, 0.3)'} : {borderColor: 'rgba(217, 119, 6, 0.2)'}}>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>
            Add Note
          </label>
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
              darkMode
                ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100 placeholder-slate-400'
                : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800 placeholder-amber-600/50'
            }`}
            placeholder="Add a note to your task..."
            rows="3"
          />
          <button
            onClick={handleAddNote}
            className={`mt-2 px-4 py-2 rounded-lg text-white font-medium transition transform hover:scale-105 ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            ✓ Add Note
          </button>
        </div>

        {/* Notes List */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>
            All Notes ({notes.length})
          </h3>
          {loading && <p className={darkMode ? 'text-slate-400' : 'text-gray-500'}>Loading notes...</p>}
          {!loading && notes.length === 0 && (
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No notes yet. Add one above!</p>
          )}
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/40' : 'bg-white/40'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className={darkMode ? 'text-slate-100' : 'text-gray-800'}>{note.content}</p>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className={`px-2 py-1 rounded text-sm transition ${
                      darkMode
                        ? 'bg-red-600/30 hover:bg-red-600/50 text-red-200'
                        : 'bg-red-200/50 hover:bg-red-200 text-red-800'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-2 rounded-lg font-medium transition ${
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default function Dashboard({ darkMode, setDarkMode }) {
  const { logout } = useAuth();
  const { 
    tasks, 
    loading, 
    createTask, 
    markComplete, 
    markPending, 
    deleteTask, 
    getNotes, 
    addNote, 
    deleteNote, 
    createRecurringTask, 
    updateTaskOrder,
    logTime,
    getTimeLogs,
    addSubtask,
    toggleSubtask,
    deleteSubtask
  } = useTasks();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('status');
  const [showPomodoro, setShowPomodoro] = useState(null);
  const [showTaskNotes, setShowTaskNotes] = useState(null);
  const [toast, setToast] = useState(null);

  // Setup drag and drop sensors
  const _sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const pendingTasksLocal = tasks.filter(t => t.status === 'pending');
      const oldIndex = pendingTasksLocal.findIndex(t => t.id === active.id);
      const newIndex = pendingTasksLocal.findIndex(t => t.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder pending tasks
        const reorderedPending = arrayMove(pendingTasksLocal, oldIndex, newIndex);
        const taskIds = reorderedPending.map(t => t.id);
        
        try {
          // This will update both local state and backend
          await updateTaskOrder(taskIds);
        } catch {
          setToast({ message: '✗ Failed to save task order', type: 'error' });
        }
      }
    }
  };
  
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
    } catch {
      setToast({ message: '✗ Failed to create task', type: 'error' });
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await markComplete(taskId);
      const task = tasks.find(t => t.id === taskId);
      
      // Auto-create recurring task
      if (task && task.recurrence && task.recurrence !== 'none') {
        try {
          await createRecurringTask(taskId);
          setToast({ message: `🎉 Task completed! Next instance created for ${task.recurrence} schedule.`, type: 'success' });
        } catch {
          setToast({ message: '🎉 Task completed!', type: 'success' });
        }
      } else {
        setToast({ message: '🎉 Task completed!', type: 'success' });
      }
    } catch {
      setToast({ message: '✗ Failed to complete task', type: 'error' });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K - Open task creation form
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowForm(true);
      }
      // Ctrl+Shift+D - Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        setDarkMode(prev => !prev);
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setShowForm(false);
        setShowPomodoro(null);
        setShowTaskNotes(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { label: '📅 Upcoming', color: 'bg-blue-100/50 text-blue-800 border-blue-300/50', days: null };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { label: '🔴 Overdue', color: 'bg-red-100/50 text-red-800 border-red-300/50', days: daysLeft };
    } else if (daysLeft === 0) {
      return { label: '🟡 Due Today', color: 'bg-yellow-100/50 text-yellow-800 border-yellow-300/50', days: 0 };
    } else if (daysLeft === 1) {
      return { label: '🟠 Due Tomorrow', color: 'bg-orange-100/50 text-orange-800 border-orange-300/50', days: 1 };
    } else {
      return { label: `🟢 Due in ${daysLeft} days`, color: 'bg-green-100/50 text-green-800 border-green-300/50', days: daysLeft };
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
      if (!a.deadline && !b.deadline) return new Date(b.created_at) - new Date(a.created_at);
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'status') {
      // For pending tasks, respect the drag-drop order field
      // For completed tasks, sort by status
      if (a.status === 'pending' && b.status === 'pending') {
        return (a.order || 0) - (b.order || 0);
      }
      const statusPriority = (t) => {
        if (t.status === 'completed') return 3;
        if (!t.deadline) return 2;
        const daysLeft = Math.floor((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return 0;
        if (daysLeft === 0) return 1;
        return 2;
      };
      return statusPriority(a) - statusPriority(b);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const totalTasks = tasks.length;
  const totalPending = tasks.filter(t => t.status === 'pending').length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalOverdue = tasks.filter(t => {
    if (t.status !== 'pending' || !t.deadline) return false;
    const daysLeft = Math.floor((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft < 0;
  }).length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-amber-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-md border-b transition-all duration-300 sticky top-0 z-40 ${
        darkMode
          ? 'bg-slate-800/70 border-slate-700/50'
          : 'bg-white/70 border-amber-100/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className={`text-4xl font-bold ${
              darkMode
                ? 'text-linear-to-r from-blue-400 to-cyan-300'
                : 'text-linear-to-r from-amber-700 to-orange-600'
            }`}>
              Duna
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-blue-300' : 'text-amber-600'}`}>
              Your Study Companion
            </p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {totalOverdue > 0 && (
              <div className={`px-3 py-2 rounded-lg font-semibold ${
                darkMode
                  ? 'bg-red-500/30 text-red-300'
                  : 'bg-red-100/50 text-red-700'
              }`}>
                🔔 {totalOverdue} Overdue
              </div>
            )}
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
                  ? 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
              }`}
            >
              📊 Stats
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className={`px-4 py-2 rounded-lg text-white font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`px-4 py-2 rounded-lg text-white font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              ⚙️ Settings
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-blue-500/20 border border-blue-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Total Tasks</p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>{totalTasks}</p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-blue-400' : 'bg-amber-300'}`}></div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-orange-500/20 border border-orange-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>Pending</p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>{totalPending}</p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-orange-400' : 'bg-orange-300'}`}></div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-green-500/20 border border-green-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Completed</p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>{totalCompleted}</p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-green-400' : 'bg-green-300'}`}></div>
          </div>
          <div className={`backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 ${
            darkMode
              ? 'bg-red-500/20 border border-red-400/30'
              : 'bg-white/40 border border-white/60'
          }`}>
            <p className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>Overdue</p>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{totalOverdue}</p>
            <div className={`h-1 rounded-full mt-4 w-full opacity-60 ${darkMode ? 'bg-red-400' : 'bg-red-300'}`}></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="🔍 Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
              darkMode
                ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 focus:bg-slate-700 placeholder-slate-400 text-slate-100'
                : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 focus:bg-white/60 placeholder-amber-600/50 text-gray-800'
            }`}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                  darkMode
                    ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                    : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                }`}
              >
                <option value="all">All</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                  darkMode
                    ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                    : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                }`}
              >
                <option value="all">All</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                  darkMode
                    ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                    : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                }`}
              >
                <option value="status">📌 Status</option>
                <option value="deadline">⏰ Deadline</option>
                <option value="priority">⭐ Priority</option>
                <option value="created">📅 Created</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowForm(!showForm)}
                className={`w-full text-white px-6 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                  darkMode
                    ? 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                }`}
              >
                {showForm ? '✕ Cancel' : '+ New Task'}
              </button>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                        : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                    }`}
                    placeholder="Task title..."
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                        : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                    darkMode
                      ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                      : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                  }`}
                  placeholder="Task details..."
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Priority</label>
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
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Deadline</label>
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

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-amber-700'}`}>Repeat</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg backdrop-blur-sm focus:outline-none focus:ring-2 transition ${
                      darkMode
                        ? 'bg-slate-700/60 border-slate-600/50 focus:ring-blue-500 text-slate-100'
                        : 'border-amber-200/50 bg-white/40 focus:ring-amber-400 text-gray-800'
                    }`}
                  >
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div></div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className={`flex-1 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                    darkMode
                      ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
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

        {/* Tasks Display */}
        {loading ? (
          <p className={`text-center py-12 text-lg ${darkMode ? 'text-blue-300' : 'text-amber-600'}`}>
            Loading tasks...
          </p>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-400' : 'text-amber-600'}`}>
              No tasks found. Let's get studying! 🚀
            </p>
            <button
              onClick={() => setShowForm(true)}
              className={`text-white px-6 py-2 rounded-lg font-medium transition shadow-lg transform hover:scale-105 ${
                darkMode
                  ? 'bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
              }`}
            >
              Create First Task
            </button>
          </div>
        ) : (
          <DndContext
            sensors={_sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pendingTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    darkMode={darkMode}
                    onComplete={handleCompleteTask}
                    onDelete={deleteTask}
                    onPomodoro={setShowPomodoro}
                    onNotes={setShowTaskNotes}
                    getDeadlineStatus={getDeadlineStatus}
                    logTime={logTime}
                    getTimeLogs={getTimeLogs}
                    addSubtask={addSubtask}
                    toggleSubtask={toggleSubtask}
                    deleteSubtask={deleteSubtask}
                  />
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
                        {task.category && (
                          <p className={`text-xs mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                            📚 {task.category}
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
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => markPending(task.id)}
                          className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
                            darkMode
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          ↩ Undo
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-md transform hover:scale-105 ${
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
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* Pomodoro Modal */}
      {showPomodoro && (
        <PomodoroTimer task={showPomodoro} darkMode={darkMode} onClose={() => setShowPomodoro(null)} />
      )}

      {/* Task Notes Modal */}
      {showTaskNotes && (
        <TaskNotesModal 
          task={showTaskNotes} 
          darkMode={darkMode} 
          onClose={() => setShowTaskNotes(null)}
          onAddNote={addNote}
          getNotes={getNotes}
          deleteNote={deleteNote}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
